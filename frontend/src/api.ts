import { Task } from './store/taskStore'

const API_BASE = "http://localhost:8000"  // "https://your-api-url.amazonaws.com"

const token = localStorage.getItem("token");

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`,
})

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  })
  return await res.json()
}

export const fetchTasks = async () => {
  const res = await fetch(`${API_BASE}/tasks`, { headers: getHeaders() })
  return await res.json()
}

export const createTask = async (
  task: Omit<Task, 'id'>
): Promise<Task> => {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(task),
  })

  if (!res.ok) {
    throw new Error('Error creating task')
  }

  return await res.json()
}

export const updateTask = async (
  id: string,
  updates: Partial<Omit<Task, 'id'>>
): Promise<Task> => {
  //console.log("Updating task with id:", id);
  //console.log("Updating task with:", updates);
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  })
  //console.log("checpoint 1:");
  //console.log("res:", res);
  if (!res.ok) {
    throw new Error('Error updating task')
  }

  return await res.json()
}

export const deleteTask = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })

  if (!res.ok) {
    throw new Error('Error deleting task')
  }
}