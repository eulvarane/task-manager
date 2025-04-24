import { useTaskStore, TaskStatus } from '../store/taskStore'
import TaskCard from '../components/TaskCard'
import { Container, Typography, TextField, Button, Box  } from '@mui/material'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { createTask } from '../api'

export default function Home() {
  const {
    tasks,
    addTask,
    fetchTasksFromApi,
    updateStatus,
    deleteTask
  } = useTaskStore()

  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchTasksFromApi()
  }, [])

  const handleAdd = async () => {
    if (!title.trim() || !description.trim()) return

    try {
      const newTask = await createTask({
        title,
        description,
        status: 'por hacer',
      })

      addTask(newTask) // includes the backend-generated ID
      setTitle('')
      setDescription('')
    } catch (err) {
      console.error('Error adding task:', err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Lista de Tareas</Typography>
        <Button onClick={handleLogout} variant="outlined" color="error">
          Cerrar sesión
        </Button>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Bienvenido, {user?.email}
      </Typography>

      <TextField
        fullWidth
        label="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleAdd}>
        Agregar tarea
      </Button>

      <Button variant="outlined" sx={{ mt: 2, mb: 2 }} onClick={() => navigate('/graph')}>
        Ver gráfico de tareas
      </Button>

      <div style={{ marginTop: 24 }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={(status: TaskStatus) => updateStatus(task.id, status)}
            onDelete={() => deleteTask(task.id)}
        />
        ))}
      </div>
    </Container>
  )
}