import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { createMockAxiosResponse } from '@/test/setup'
import { act } from '@testing-library/react'
import Register from '../Register'
import * as api from '@/services/api'

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

// react-hot-toast is already mocked in test setup


describe('Register Component - Input Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Input Fields', () => {
    it('should render all required input fields', () => {
      render(<Register />)

      // Check for labels
      expect(screen.getByText(/名称.*Name/)).toBeInTheDocument()
      expect(screen.getByText(/邮箱.*Email/)).toBeInTheDocument()
      expect(screen.getByText(/密码.*Password/)).toBeInTheDocument()
      expect(screen.getByText('OKX API Key')).toBeInTheDocument()
      expect(screen.getByText('OKX API Secret')).toBeInTheDocument()
      expect(screen.getByText('OKX Passphrase')).toBeInTheDocument()
      expect(screen.getByText('OKX UID')).toBeInTheDocument()
      
      // Check for input fields by placeholder or type
      const inputs = screen.getAllByRole('textbox')
      const passwordInputs = screen.getAllByPlaceholderText('')
      expect(inputs.length + passwordInputs.length).toBeGreaterThanOrEqual(7)
    })

    it('should have correct input types for each field', () => {
      const { container } = render(<Register />)

      // Get all inputs by their order in the form
      const inputs = container.querySelectorAll('input')
      const [nameInput, emailInput, passwordInput, apiKeyInput, apiSecretInput, passphraseInput, uidInput] = inputs

      // Verify input types
      expect(nameInput).not.toHaveAttribute('type', 'password')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(apiKeyInput).not.toHaveAttribute('type', 'password') // Should be text or no type
      expect(apiSecretInput).not.toHaveAttribute('type', 'password') // Should be text or no type
      expect(passphraseInput).toHaveAttribute('type', 'password')
      expect(uidInput).not.toHaveAttribute('type', 'password') // Should be text or no type
    })

    it('should accept user input in all fields', async () => {
      const { container } = render(<Register />)

      // Get all inputs by their order in the form
      const inputs = container.querySelectorAll('input')
      const [nameInput, emailInput, passwordInput, apiKeyInput, apiSecretInput, passphraseInput, uidInput] = inputs

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test User' } })
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } })
        fireEvent.change(apiSecretInput, { target: { value: 'test-api-secret' } })
        fireEvent.change(passphraseInput, { target: { value: 'test-passphrase' } })
        fireEvent.change(uidInput, { target: { value: 'test-uid' } })
      })

      expect(nameInput).toHaveValue('Test User')
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
      expect(apiKeyInput).toHaveValue('test-api-key')
      expect(apiSecretInput).toHaveValue('test-api-secret')
      expect(passphraseInput).toHaveValue('test-passphrase')
      expect(uidInput).toHaveValue('test-uid')
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      render(<Register />)

      const submitButton = screen.getByRole('button', { name: /注册.*更新/ })

      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('请输入姓名')).toBeInTheDocument()
        expect(screen.getByText('请输入邮箱')).toBeInTheDocument()
        expect(screen.getByText('请输入密码')).toBeInTheDocument()
        expect(screen.getByText('请输入OKX API Key')).toBeInTheDocument()
        expect(screen.getByText('请输入OKX API Secret')).toBeInTheDocument()
        expect(screen.getByText('请输入OKX Passphrase')).toBeInTheDocument()
        expect(screen.getByText('请输入OKX UID')).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      render(<Register />)

      const emailInput = screen.getByLabelText(/邮箱.*Email/)
      const submitButton = screen.getByRole('button', { name: /注册.*更新/ })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument()
      })
    })

    it('should accept valid email format', async () => {
      render(<Register />)

      const emailInput = screen.getByLabelText(/邮箱.*Email/)

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.blur(emailInput)
      })

      await waitFor(() => {
        expect(screen.queryByText('请输入有效的邮箱地址')).not.toBeInTheDocument()
      })
    })
  })

  describe('Auto-fill Functionality', () => {
    it('should open auto-fill modal when button is clicked', async () => {
      render(<Register />)

      const autoFillButton = screen.getByText(/快速填充OKX凭据/)

      await act(async () => {
        fireEvent.click(autoFillButton)
      })

      expect(screen.getByText(/粘贴OKX API凭据/)).toBeInTheDocument()
      expect(screen.getByText(/请粘贴您的OKX API凭据信息/)).toBeInTheDocument()
    })

    it('should parse and fill credentials from textarea', async () => {
      render(<Register />)

      // Open auto-fill modal
      const autoFillButton = screen.getByText(/快速填充OKX凭据/)
      await act(async () => {
        fireEvent.click(autoFillButton)
      })

      // Fill textarea with credential data
      const textarea = screen.getByPlaceholderText(/示例格式/)
      const parseButton = screen.getByText(/自动填充/)

      const credentialsData = `
        apikey = test-api-key
        secretkey = test-secret-key
        passphrase = test-passphrase
        uid = test-uid
      `

      await act(async () => {
        fireEvent.change(textarea, { target: { value: credentialsData } })
        fireEvent.click(parseButton)
      })

      await waitFor(() => {
        expect(screen.getByLabelText(/OKX API Key/)).toHaveValue('test-api-key')
        expect(screen.getByLabelText(/OKX API Secret/)).toHaveValue('test-secret-key')
        expect(screen.getByLabelText(/OKX Passphrase/)).toHaveValue('test-passphrase')
        expect(screen.getByLabelText(/OKX UID/)).toHaveValue('test-uid')
      })
    })

    it('should handle different credential formats', async () => {
      render(<Register />)

      // Open auto-fill modal
      const autoFillButton = screen.getByText(/快速填充OKX凭据/)
      await act(async () => {
        fireEvent.click(autoFillButton)
      })

      const textarea = screen.getByPlaceholderText(/示例格式/)
      const parseButton = screen.getByText(/自动填充/)

      // Test colon-separated format
      const colonFormat = `
        api key: test-api-key-colon
        secret: test-secret-colon
        passphrase: test-passphrase-colon
        uid: test-uid-colon
      `

      await act(async () => {
        fireEvent.change(textarea, { target: { value: colonFormat } })
        fireEvent.click(parseButton)
      })

      await waitFor(() => {
        expect(screen.getByLabelText(/OKX API Key/)).toHaveValue('test-api-key-colon')
        expect(screen.getByLabelText(/OKX API Secret/)).toHaveValue('test-secret-colon')
        expect(screen.getByLabelText(/OKX Passphrase/)).toHaveValue('test-passphrase-colon')
        expect(screen.getByLabelText(/OKX UID/)).toHaveValue('test-uid-colon')
      })
    })

    it('should close auto-fill modal when cancel is clicked', async () => {
      render(<Register />)

      // Open auto-fill modal
      const autoFillButton = screen.getByText(/快速填充OKX凭据/)
      await act(async () => {
        fireEvent.click(autoFillButton)
      })

      expect(screen.getByText(/粘贴OKX API凭据/)).toBeInTheDocument()

      // Click cancel
      const cancelButton = screen.getByText(/取消/)
      await act(async () => {
        fireEvent.click(cancelButton)
      })

      await waitFor(() => {
        expect(screen.queryByText(/粘贴OKX API凭据/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const mockRegister = vi.mocked(api.api.register)
      mockRegister.mockResolvedValue(createMockAxiosResponse({ success: true }))

      render(<Register />)

      // Fill all required fields
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/名称.*Name/), { target: { value: 'Test User' } })
        fireEvent.change(screen.getByLabelText(/邮箱.*Email/), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByLabelText(/密码.*Password/), { target: { value: 'password123' } })
        fireEvent.change(screen.getByLabelText(/OKX API Key/), { target: { value: 'test-api-key' } })
        fireEvent.change(screen.getByLabelText(/OKX API Secret/), { target: { value: 'test-api-secret' } })
        fireEvent.change(screen.getByLabelText(/OKX Passphrase/), { target: { value: 'test-passphrase' } })
        fireEvent.change(screen.getByLabelText(/OKX UID/), { target: { value: 'test-uid' } })
      })

      const submitButton = screen.getByRole('button', { name: /注册.*更新/ })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          okxApiKey: 'test-api-key',
          okxApiSecret: 'test-api-secret',
          okxPassphrase: 'test-passphrase',
          okxUid: 'test-uid',
        })
      })
    })

    it('should disable submit button during loading', async () => {
      const mockRegister = vi.mocked(api.api.register)
      mockRegister.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<Register />)

      // Fill all required fields
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/名称.*Name/), { target: { value: 'Test User' } })
        fireEvent.change(screen.getByLabelText(/邮箱.*Email/), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByLabelText(/密码.*Password/), { target: { value: 'password123' } })
        fireEvent.change(screen.getByLabelText(/OKX API Key/), { target: { value: 'test-api-key' } })
        fireEvent.change(screen.getByLabelText(/OKX API Secret/), { target: { value: 'test-api-secret' } })
        fireEvent.change(screen.getByLabelText(/OKX Passphrase/), { target: { value: 'test-passphrase' } })
        fireEvent.change(screen.getByLabelText(/OKX UID/), { target: { value: 'test-uid' } })
      })

      const submitButton = screen.getByRole('button', { name: /注册.*更新/ })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/提交中.../)).toBeInTheDocument()
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('Local Storage Integration', () => {
    it('should save form data to localStorage', async () => {
      render(<Register />)

      const nameInput = screen.getByLabelText(/名称.*Name/)

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test User' } })
      })

      // Wait for useEffect to trigger
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'registerFormData',
          expect.stringContaining('"name":"Test User"')
        )
      })
    })

    it('should load saved form data from localStorage', () => {
      const savedData = JSON.stringify({
        name: 'Saved User',
        email: 'saved@example.com',
        okxApiKey: 'saved-api-key',
      })

      mockLocalStorage.getItem.mockReturnValue(savedData)

      render(<Register />)

      expect(screen.getByLabelText(/名称.*Name/)).toHaveValue('Saved User')
      expect(screen.getByLabelText(/邮箱.*Email/)).toHaveValue('saved@example.com')
      expect(screen.getByLabelText(/OKX API Key/)).toHaveValue('saved-api-key')
    })

    it('should clear saved data when clear button is clicked', async () => {
      const savedData = JSON.stringify({ name: 'Saved User' })
      mockLocalStorage.getItem.mockReturnValue(savedData)

      render(<Register />)

      // Should show saved data indicator
      expect(screen.getByText(/发现未完成的注册信息/)).toBeInTheDocument()

      const clearButton = screen.getByText(/清除/)
      await act(async () => {
        fireEvent.click(clearButton)
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('registerFormData')
    })
  })

  describe('Input Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<Register />)

      expect(screen.getByLabelText(/名称.*Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/邮箱.*Email/)).toBeInTheDocument()
      expect(screen.getByLabelText(/密码.*Password/)).toBeInTheDocument()
      expect(screen.getByLabelText(/OKX API Key/)).toBeInTheDocument()
      expect(screen.getByLabelText(/OKX API Secret/)).toBeInTheDocument()
      expect(screen.getByLabelText(/OKX Passphrase/)).toBeInTheDocument()
      expect(screen.getByLabelText(/OKX UID/)).toBeInTheDocument()
    })

    it('should have proper ARIA attributes for error states', async () => {
      render(<Register />)

      const submitButton = screen.getByRole('button', { name: /注册.*更新/ })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/名称.*Name/)
        expect(nameInput).toHaveAttribute('aria-invalid')
      })
    })
  })

  describe('Input Trimming', () => {
    it('should trim whitespace from inputs on submission', async () => {
      const mockRegister = vi.mocked(api.api.register)
      mockRegister.mockResolvedValue(createMockAxiosResponse({ success: true }))

      render(<Register />)

      // Fill fields with leading/trailing spaces
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/名称.*Name/), { target: { value: '  Test User  ' } })
        fireEvent.change(screen.getByLabelText(/邮箱.*Email/), { target: { value: '  test@example.com  ' } })
        fireEvent.change(screen.getByLabelText(/密码.*Password/), { target: { value: '  password123  ' } })
        fireEvent.change(screen.getByLabelText(/OKX API Key/), { target: { value: '  test-api-key  ' } })
        fireEvent.change(screen.getByLabelText(/OKX API Secret/), { target: { value: '  test-api-secret  ' } })
        fireEvent.change(screen.getByLabelText(/OKX Passphrase/), { target: { value: '  test-passphrase  ' } })
        fireEvent.change(screen.getByLabelText(/OKX UID/), { target: { value: '  test-uid  ' } })
      })

      const submitButton = screen.getByRole('button', { name: /注册.*更新/ })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com', 
          password: 'password123',
          okxApiKey: 'test-api-key',
          okxApiSecret: 'test-api-secret',
          okxPassphrase: 'test-passphrase',
          okxUid: 'test-uid',
        })
      })
    })
  })
})