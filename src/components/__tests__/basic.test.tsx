import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'

// Simple components for testing
const TestComponent = () => {
  const [value, setValue] = React.useState('')
  
  return (
    <div>
      <h1>Test Component</h1>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => setValue(e.target.value)}
        data-testid="test-input"
      />
      <p data-testid="test-output">{value}</p>
    </div>
  )
}

describe('Basic Testing Setup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a simple component', () => {
    render(<TestComponent />)
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)
    
    const input = screen.getByTestId('test-input')
    await user.type(input, 'Hello World')
    
    expect(screen.getByTestId('test-output')).toHaveTextContent('Hello World')
  })

  it('can render with router', () => {
    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>
    )
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('validates form requirements', () => {
    const mockSubmit = vi.fn()
    
    const FormComponent = () => {
      const [name, setName] = React.useState('')
      const [error, setError] = React.useState('')
      
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
          setError('Name is required')
          return
        }
        mockSubmit({ name })
      }
      
      return (
        <form onSubmit={handleSubmit}>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="name-input"
          />
          <button type="submit">Submit</button>
          {error && <div data-testid="error">{error}</div>}
        </form>
      )
    }
    
    render(<FormComponent />)
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('validates async operations', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 10))
    )
    
    const AsyncComponent = () => {
      const [loading, setLoading] = React.useState(false)
      const [result, setResult] = React.useState('')
      
      const handleClick = async () => {
        setLoading(true)
        try {
          const response = await mockSubmit()
          setResult(response.success ? 'Success' : 'Failed')
        } catch {
          setResult('Error')
        } finally {
          setLoading(false)
        }
      }
      
      return (
        <div>
          <button onClick={handleClick} disabled={loading}>
            {loading ? 'Loading...' : 'Click me'}
          </button>
          {result && <div data-testid="result">{result}</div>}
        </div>
      )
    }
    
    render(<AsyncComponent />)
    
    const button = screen.getByRole('button', { name: /Click me/ })
    await user.click(button)
    
    // Wait for async operation to complete
    await screen.findByTestId('result')
    expect(screen.getByTestId('result')).toHaveTextContent('Success')
    expect(mockSubmit).toHaveBeenCalled()
  })
})