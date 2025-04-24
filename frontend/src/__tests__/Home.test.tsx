import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../pages/Home'
import { useTaskStore } from '../store/taskStore'
import { BrowserRouter } from 'react-router-dom'
import '@testing-library/jest-dom'


beforeEach(() => {
    useTaskStore.setState({ tasks: [] })
})

const renderWithRouter = (ui: React.ReactNode) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Home Page', () => {
    it('renders input fields and button', () => {
      renderWithRouter(<Home />)
  
      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /agregar tarea/i })).toBeInTheDocument()
    })
  
    it('adds a new task', () => {
      renderWithRouter(<Home />)
  
      fireEvent.change(screen.getByLabelText(/título/i), {
        target: { value: 'Hacer mercado' },
      })
      fireEvent.change(screen.getByLabelText(/descripción/i), {
        target: { value: 'Comprar frutas' },
      })
      fireEvent.click(screen.getByRole('button', { name: /agregar tarea/i }))
  
      expect(screen.getByText('Hacer mercado')).toBeInTheDocument()
      expect(screen.getByText('Comprar frutas')).toBeInTheDocument()
    })
  })