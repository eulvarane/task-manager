import { create } from 'zustand'
import { fetchTasks, updateTask as updateTaskApi, deleteTask as deleteTaskApi} from '../api'

export type TaskStatus = 'por hacer' | 'en progreso' | 'completada'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
}

interface TaskStore {
  tasks: Task[]
  fetchTasksFromApi: () => Promise<void>
  addTask: (task: Task) => void
  updateStatus: (id: string, status: TaskStatus) => Promise<void> 
  deleteTask: (id: string) => Promise<void>                       
}


export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  fetchTasksFromApi: async () => {
    try {
      const tasks = await fetchTasks()
      set({ tasks })
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    }
  },

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  updateStatus: async (id, status) => {
    try {
      const updated = await updateTaskApi(id, { status })
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? updated : t
        ),
      }))
    } catch (err) {
      console.error("Failed to update task:", err)
    }
  },

  deleteTask: async (id) => {
    try {
      await deleteTaskApi(id)
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }))
    } catch (err) {
      console.error("Failed to delete task:", err)
    }
  }
}))
