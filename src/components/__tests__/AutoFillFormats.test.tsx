import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { act } from '@testing-library/react'
import Register from '../Register'

// Mock API
vi.mock('@/services/api', () => ({
  api: {
    register: vi.fn(),
  },
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('Register Auto-Fill Format Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should parse OKX App JSON format correctly', async () => {
    const { container } = render(<Register />)

    // Open auto-fill modal
    const autoFillButton = screen.getByText(/快速填充OKX凭据/)
    await act(async () => {
      fireEvent.click(autoFillButton)
    })

    // OKX App format data
    const appFormatData = `{"apiKey":"d7d2a7c9-4253-4e43-9534-4d8d9824ed70","secretKey":"7EABA694D263A3DE855F1D4028B39518","API name":"z30337-2","IP":"0","Permissions":"只读, 交易"}`

    const textarea = screen.getByPlaceholderText(/支持两种格式/)
    
    await act(async () => {
      fireEvent.change(textarea, { target: { value: appFormatData } })
    })

    // Click auto-fill button
    const parseButton = screen.getByText('自动填充')
    await act(async () => {
      fireEvent.click(parseButton)
    })

    // Get inputs by their order in the form
    const inputs = container.querySelectorAll('input')
    const [, , , apiKeyInput, apiSecretInput, , uidInput] = inputs

    await waitFor(() => {
      expect(apiKeyInput).toHaveValue('d7d2a7c9-4253-4e43-9534-4d8d9824ed70')
      expect(apiSecretInput).toHaveValue('7EABA694D263A3DE855F1D4028B39518')
      expect(uidInput).toHaveValue('z30337-2')
    })
  })

  it('should parse OKX Web key-value format correctly', async () => {
    const { container } = render(<Register />)

    // Open auto-fill modal
    const autoFillButton = screen.getByText(/快速填充OKX凭据/)
    await act(async () => {
      fireEvent.click(autoFillButton)
    })

    // OKX Web format data
    const webFormatData = `apikey = "a9d859af-0b87-40e7-95c6-29f43add797c"
secretkey = "3CF2BE32D1BB7B7C781167A7FEF2287B"
IP = ""
备注名 = "t30337"
权限 = "读取/交易"`

    const textarea = screen.getByPlaceholderText(/支持两种格式/)
    
    await act(async () => {
      fireEvent.change(textarea, { target: { value: webFormatData } })
    })

    // Click auto-fill button
    const parseButton = screen.getByText('自动填充')
    await act(async () => {
      fireEvent.click(parseButton)
    })

    // Get inputs by their order in the form
    const inputs = container.querySelectorAll('input')
    const [, , , apiKeyInput, apiSecretInput, , uidInput] = inputs

    await waitFor(() => {
      expect(apiKeyInput).toHaveValue('a9d859af-0b87-40e7-95c6-29f43add797c')
      expect(apiSecretInput).toHaveValue('3CF2BE32D1BB7B7C781167A7FEF2287B')
      expect(uidInput).toHaveValue('t30337')
    })
  })

  it('should parse Web format without quotes', async () => {
    const { container } = render(<Register />)

    // Open auto-fill modal
    const autoFillButton = screen.getByText(/快速填充OKX凭据/)
    await act(async () => {
      fireEvent.click(autoFillButton)
    })

    // Web format without quotes
    const webFormatData = `apikey = d7d2a7c9-4253-4e43-9534-4d8d9824ed70
secretkey = 7EABA694D263A3DE855F1D4028B39518
passphrase = MyPassphrase123
uid = u12345`

    const textarea = screen.getByPlaceholderText(/支持两种格式/)
    
    await act(async () => {
      fireEvent.change(textarea, { target: { value: webFormatData } })
    })

    // Click auto-fill button
    const parseButton = screen.getByText('自动填充')
    await act(async () => {
      fireEvent.click(parseButton)
    })

    // Get inputs by their order in the form
    const inputs = container.querySelectorAll('input')
    const [, , , apiKeyInput, apiSecretInput, passphraseInput, uidInput] = inputs

    await waitFor(() => {
      expect(apiKeyInput).toHaveValue('d7d2a7c9-4253-4e43-9534-4d8d9824ed70')
      expect(apiSecretInput).toHaveValue('7EABA694D263A3DE855F1D4028B39518')
      expect(passphraseInput).toHaveValue('MyPassphrase123')
      expect(uidInput).toHaveValue('u12345')
    })
  })

  it('should handle invalid JSON format gracefully', async () => {
    render(<Register />)

    // Open auto-fill modal
    const autoFillButton = screen.getByText(/快速填充OKX凭据/)
    await act(async () => {
      fireEvent.click(autoFillButton)
    })

    // Invalid JSON
    const invalidJson = `{"apiKey":"test-key", "secretKey":}`

    const textarea = screen.getByPlaceholderText(/支持两种格式/)
    
    await act(async () => {
      fireEvent.change(textarea, { target: { value: invalidJson } })
    })

    // Click auto-fill button
    const parseButton = screen.getByText('自动填充')
    await act(async () => {
      fireEvent.click(parseButton)
    })

    // Should show error message
    await waitFor(() => {
      // The error should be displayed via toast, so we just verify the modal is still open
      expect(screen.getByText(/粘贴OKX API凭据/)).toBeInTheDocument()
    })
  })

  it('should handle empty credentials gracefully', async () => {
    render(<Register />)

    // Open auto-fill modal
    const autoFillButton = screen.getByText(/快速填充OKX凭据/)
    await act(async () => {
      fireEvent.click(autoFillButton)
    })

    // Click auto-fill button with empty textarea
    const parseButton = screen.getByText('自动填充')
    await act(async () => {
      fireEvent.click(parseButton)
    })

    // Should show error message and modal should remain open
    await waitFor(() => {
      expect(screen.getByText(/粘贴OKX API凭据/)).toBeInTheDocument()
    })
  })

  it('should show placeholder text with both format examples', () => {
    render(<Register />)

    // Open auto-fill modal
    const autoFillButton = screen.getByText(/快速填充OKX凭据/)
    fireEvent.click(autoFillButton)

    // Check that placeholder contains both format examples
    const textarea = screen.getByPlaceholderText(/支持两种格式/)
    expect(textarea.placeholder).toContain('OKX App格式')
    expect(textarea.placeholder).toContain('OKX Web格式')
    expect(textarea.placeholder).toContain('d7d2a7c9-4253-4e43-9534-4d8d9824ed70')
    expect(textarea.placeholder).toContain('a9d859af-0b87-40e7-95c6-29f43add797c')
  })
})