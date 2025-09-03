import React, { ReactElement } from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <Toaster />
      {children}
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => rtlRender(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from testing-library/react except render
export {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
  getByRole,
  getByText,
  queryByText,
  findByText,
  act,
  fireEvent,
  createEvent,
  buildQueries,
} from '@testing-library/react'

// Export our custom render
export { customRender as render }