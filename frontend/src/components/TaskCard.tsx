
import { Card, CardContent, Typography, Button, MenuItem, Select } from '@mui/material'
import { Task, TaskStatus } from '../store/taskStore'

interface TaskCardProps {
  task: Task
  onStatusChange: (newStatus: TaskStatus) => void
  onDelete: () => void
}

const statusOptions: TaskStatus[] = ['por hacer', 'en progreso', 'completada']

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{task.title}</Typography>
        <Typography>{task.description}</Typography>

        <Select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
          sx={{ mt: 2 }}
        >
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="outlined"
          color="error"
          onClick={onDelete}
          sx={{ mt: 2, ml: 2 }}
        >
          Eliminar
        </Button>
      </CardContent>
    </Card>
  )
}


