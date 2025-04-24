import { useTaskStore } from '../store/taskStore'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { Container, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658']

export default function Graph() {
  const { tasks } = useTaskStore()
  const navigate = useNavigate()

  const statusCounts = {
    'por hacer': 0,
    'en progreso': 0,
    'completada': 0
  }

  tasks.forEach(task => {
    statusCounts[task.status]++
  })

  const data = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Gráfico de Tareas</Typography>

      <PieChart width={400} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>

      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/home')}>
        Volver a la lista de tareas
      </Button>
    </Container>
  )
}
