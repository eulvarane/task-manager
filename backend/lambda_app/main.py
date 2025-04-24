from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from mangum import Mangum
from pymongo import MongoClient
from dotenv import load_dotenv
from uuid import uuid4
from passlib.context import CryptContext
import os

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder


load_dotenv()

app = FastAPI()
handler = Mangum(app)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB
MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)
db = client["task_db"]
tasks_collection = db["tasks"]
users_collection = db["users"]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Task models
class TaskCreate(BaseModel):
    title: str
    description: str
    status: Literal["por hacer", "en progreso", "completada"] = "por hacer"

class TaskModel(TaskCreate):
    id: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Literal["por hacer", "en progreso", "completada"]] = None

# User models
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserInDB(BaseModel):
    id: str
    email: EmailStr

# Auth Setup
SECRET_KEY = "your-secret-key" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Helpers
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    print("Token received:", token)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("Validation Error:", exc.errors())  
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder({"detail": exc.errors()}),
    )



# GET /tasks
@app.get("/tasks")
def get_tasks(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_tasks = list(tasks_collection.find({ "user_id": user_id }))
    for t in user_tasks:
        t["id"] = t["_id"]
        del t["_id"]
    return user_tasks

# POST /tasks
@app.post("/tasks", response_model=TaskModel)
def create_task(task: TaskCreate, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    task_dict = task.dict()
    task_dict["_id"] = str(uuid4())
    task_dict["user_id"] = user_id
    tasks_collection.insert_one(task_dict)
    task_dict["id"] = task_dict.pop("_id")
    return task_dict

# Put /Update a task
@app.put("/tasks/{task_id}", response_model=TaskModel)
def update_task(task_id: str, updated_task: TaskUpdate, current_user: str = Depends(get_current_user)):
    print("Incoming update payload:", updated_task.dict())
    task = tasks_collection.find_one({"_id": task_id, "user_id": current_user})
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = updated_task.dict(exclude_none=True)  

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    tasks_collection.update_one(
        {"_id": task_id},
        {"$set": update_data}
    )

    updated = tasks_collection.find_one({"_id": task_id})
    updated["id"] = updated.pop("_id")
    return updated


# DELETE /Delete a task
@app.delete("/tasks/{task_id}")
def delete_task(task_id: str, current_user: str = Depends(get_current_user)):
    task = tasks_collection.find_one({"_id": task_id, "user_id": current_user})
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    tasks_collection.delete_one({"_id": task_id})
    return {"detail": "Task deleted successfully"}

# POST /register
@app.post("/register", response_model=UserInDB)
def register(user: UserCreate):
    existing_user = users_collection.find_one({ "email": user.email })
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = pwd_context.hash(user.password)
    user_data = {
        "_id": str(uuid4()),
        "email": user.email,
        "password": hashed_pw
    }
    users_collection.insert_one(user_data)

    return {
        "id": user_data["_id"],
        "email": user.email
    }

# /login route
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["_id"]})
    return {"access_token": access_token, "token_type": "bearer", "user_id": user["_id"]}
