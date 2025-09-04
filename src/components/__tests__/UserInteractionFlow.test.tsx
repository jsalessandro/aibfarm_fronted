import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { act } from '@testing-library/react'
import Register from '../Register'
import Deposit from '../Deposit'
import * as api from '@/services/api'

// Mock API
vi.mock('@/services/api', () => ({
  api: {
    register: vi.fn(),
    deposit: vi.fn(),
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

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

describe('User Interaction Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete Registration Flow', () => {
    it('should complete full registration process with manual input', async () => {
      const mockRegister = vi.mocked(api.api.register)
      mockRegister.mockResolvedValue({ data: { success: true } })

      const { container } = render(<Register />)

      // Get all inputs by their order in the form
      const inputs = container.querySelectorAll('input')
      const [nameInput, emailInput, passwordInput, apiKeyInput, apiSecretInput, passphraseInput, uidInput] = inputs

      // Step 1: Fill basic information
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
        fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'SecurePassword123' } })
      })

      // Step 2: Fill OKX credentials manually
      await act(async () => {
        fireEvent.change(apiKeyInput, { target: { value: 'api-key-12345' } })
        fireEvent.change(apiSecretInput, { target: { value: 'api-secret-67890' } })
        fireEvent.change(passphraseInput, { target: { value: 'my-passphrase' } })
        fireEvent.change(uidInput, { target: { value: 'uid-99999' } })
      })

      // Step 3: Submit form
      const submitButton = screen.getByRole('button', { name: /注册.*更新/ })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      // Step 4: Verify API call
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'SecurePassword123',
          okxApiKey: 'api-key-12345',
          okxApiSecret: 'api-secret-67890',
          okxPassphrase: 'my-passphrase',
          okxUid: 'uid-99999',
        })
      })

      // Step 5: Verify success state
      await waitFor(() => {
        expect(screen.getByText(/注册成功！/)).toBeInTheDocument()
      })
    })

    it('should complete registration with auto-fill functionality', async () => {
      const mockRegister = vi.mocked(api.api.register)
      mockRegister.mockResolvedValue({ data: { success: true } })

      const { container } = render(<Register />)

      // Get all inputs by their order in the form
      const inputs = container.querySelectorAll('input')
      const [nameInput, emailInput, passwordInput] = inputs

      // Step 1: Fill basic information
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Jane Smith' } })
        fireEvent.change(emailInput, { target: { value: 'jane@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'MyPassword456' } })
      })

      // Step 2: Open auto-fill modal
      const autoFillButton = screen.getByText(/快速填充OKX凭据/)
      await act(async () => {
        fireEvent.click(autoFillButton)
      })

      expect(screen.getByText(/粘贴OKX API凭据/)).toBeInTheDocument()

      // Step 3: Paste credentials and auto-fill
      const textarea = screen.getByPlaceholderText(/支持两种格式/)
      const credentialsText = `
        apikey = auto-fill-api-key
        secretkey = auto-fill-secret-key
        passphrase = auto-fill-passphrase
        uid = auto-fill-uid
      `

      await act(async () => {
        fireEvent.change(textarea, { target: { value: credentialsText } })
      })

      const parseButton = screen.getByText(/自动填充/)
      await act(async () => {
        fireEvent.click(parseButton)
      })

      // Step 4: Verify auto-fill worked
      // Get inputs after auto-fill
      const inputsAfterFill = container.querySelectorAll('input')
      const [, , , apiKeyInputAfter, apiSecretInputAfter, passphraseInputAfter, uidInputAfter] = inputsAfterFill

      await waitFor(() => {
        expect(apiKeyInputAfter).toHaveValue('auto-fill-api-key')
        expect(apiSecretInputAfter).toHaveValue('auto-fill-secret-key')
        expect(passphraseInputAfter).toHaveValue('auto-fill-passphrase')
        expect(uidInputAfter).toHaveValue('auto-fill-uid')
      })

      // Step 5: Submit form
      const submitButton = screen.getByRole('button', { name: /注册.*更新/ })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'MyPassword456',
          okxApiKey: 'auto-fill-api-key',
          okxApiSecret: 'auto-fill-secret-key',
          okxPassphrase: 'auto-fill-passphrase',
          okxUid: 'auto-fill-uid',
        })
      })
    })

    it('should handle form persistence across page refreshes', async () => {
      // Mock saved data
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        name: 'Persisted User',
        email: 'persisted@example.com',
        okxApiKey: 'persisted-key',
      }))

      const { container } = render(<Register />)

      // Get inputs by their order in the form
      const inputs = container.querySelectorAll('input')
      const [nameInput, emailInput, , apiKeyInput] = inputs

      // Verify data was loaded
      expect(nameInput).toHaveValue('Persisted User')
      expect(emailInput).toHaveValue('persisted@example.com')
      expect(apiKeyInput).toHaveValue('persisted-key')

      // Verify persistence indicator
      expect(screen.getByText(/发现未完成的注册信息/)).toBeInTheDocument()

      // Test clear saved data
      const clearButton = screen.getByText(/清除/)
      await act(async () => {
        fireEvent.click(clearButton)
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('registerFormData')
      expect(screen.queryByText(/发现未完成的注册信息/)).not.toBeInTheDocument()
    })
  })

  describe('Complete Deposit Flow', () => {
    it('should complete full deposit process', async () => {
      const mockDeposit = vi.mocked(api.api.deposit)
      mockDeposit.mockResolvedValue({ data: { success: true } })

      const { container } = render(<Deposit />)

      // Step 1: Copy account number
      const copyButton = screen.getByText(/复制账户号码/)
      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('3733373495422976')

      // Step 2: View steps guide
      const stepsButton = screen.getByRole('button', { name: /查看充值步骤指引/ })
      await act(async () => {
        fireEvent.click(stepsButton)
      })

      // Check that the modal opened (look for heading)
      expect(screen.getByRole('heading', { name: /充值步骤指引/ })).toBeInTheDocument()

      // Step 3: Expand step details
      const firstStep = screen.getByText(/复制收款账户/)
      await act(async () => {
        fireEvent.click(firstStep.closest('div'))
      })

      // Close steps guide
      const closeStepsButton = screen.getByText(/我知道了/)
      await act(async () => {
        fireEvent.click(closeStepsButton)
      })

      // Get deposit form inputs by their order
      const inputs = container.querySelectorAll('input')
      const [usernameInput, passwordInput, referenceInput, amountInput] = inputs

      // Step 4: Fill deposit form
      await act(async () => {
        fireEvent.change(usernameInput, { target: { value: 'depositor123' } })
        fireEvent.change(passwordInput, { target: { value: 'deposit-password' } })
        fireEvent.change(referenceInput, { target: { value: 'DEP20240301001' } })
      })

      // Step 5: Use quick amount selection
      const quickAmount1000 = screen.getByText('1000 USDT')
      await act(async () => {
        fireEvent.click(quickAmount1000)
      })

      expect(amountInput).toHaveValue(1000)

      // Step 6: View help for reference code
      const referenceHelpButtons = screen.getAllByText(/查看示例/)
      await act(async () => {
        fireEvent.click(referenceHelpButtons[0])
      })

      expect(screen.getByText(/参考编号填写示例/)).toBeInTheDocument()

      // Close help modal
      const closeHelpButton = screen.getByText(/我知道了/)
      await act(async () => {
        fireEvent.click(closeHelpButton)
      })

      // Step 7: Submit form
      const submitButton = screen.getByText(/提交/)
      await act(async () => {
        fireEvent.click(submitButton)
      })

      // Step 8: Confirm in dialog
      await waitFor(() => {
        expect(screen.getByText(/确认充值信息/)).toBeInTheDocument()
      })

      const confirmButton = screen.getByText(/确认提交/)
      await act(async () => {
        fireEvent.click(confirmButton)
      })

      // Step 9: Verify API call and success
      await waitFor(() => {
        expect(mockDeposit).toHaveBeenCalledWith({
          username: 'depositor123',
          password: 'deposit-password',
          referenceCode: 'DEP20240301001',
          amount: 1000,
        })
      })

      await waitFor(() => {
        expect(screen.getByText(/充值成功！/)).toBeInTheDocument()
      })
    })

    it('should handle deposit with manual amount input', async () => {
      const mockDeposit = vi.mocked(api.api.deposit)
      mockDeposit.mockResolvedValue({ data: { success: true } })

      const { container } = render(<Deposit />)

      // Get deposit form inputs by their order
      const inputs = container.querySelectorAll('input')
      const [usernameInput, passwordInput, referenceInput, amountInput] = inputs

      // Fill form with custom amount
      await act(async () => {
        fireEvent.change(usernameInput, { target: { value: 'custom-user' } })
        fireEvent.change(passwordInput, { target: { value: 'custom-pass' } })
        fireEvent.change(referenceInput, { target: { value: 'CUSTOM123' } })
        fireEvent.change(amountInput, { target: { value: '2550.75' } })
      })

      const submitButton = screen.getByText(/提交/)
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/2550.75 USDT/)).toBeInTheDocument()
      })

      const confirmButton = screen.getByText(/确认提交/)
      await act(async () => {
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockDeposit).toHaveBeenCalledWith({
          username: 'custom-user',
          password: 'custom-pass',
          referenceCode: 'CUSTOM123',
          amount: 2550.75,
        })
      })
    })

    it('should persist username across sessions', async () => {
      // First render - save username
      const { unmount, container } = render(<Deposit />)

      // Get username input (first input in deposit form)
      const inputs = container.querySelectorAll('input')
      const usernameInput = inputs[0]

      await act(async () => {
        fireEvent.change(usernameInput, { target: { value: 'persistent-user' } })
      })

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('depositUsername', 'persistent-user')
      })

      unmount()

      // Mock the saved username
      mockLocalStorage.getItem.mockReturnValue('persistent-user')

      // Second render - should load saved username
      const { container: newContainer } = render(<Deposit />)
      const newInputs = newContainer.querySelectorAll('input')
      const newUsernameInput = newInputs[0]

      expect(newUsernameInput).toHaveValue('persistent-user')
      expect(screen.getByText(/已记住/)).toBeInTheDocument()
    })
  })

  describe('Error Handling Flows', () => {
    it('should handle registration API errors gracefully', async () => {
      const mockRegister = vi.mocked(api.api.register)
      mockRegister.mockRejectedValue(new Error('Network error'))

      const { container } = render(<Register />)

      // Get all inputs by their order in the form
      const inputs = container.querySelectorAll('input')
      const [nameInput, emailInput, passwordInput, apiKeyInput, apiSecretInput, passphraseInput, uidInput] = inputs

      // Fill form with valid data
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test User' } })
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.change(apiKeyInput, { target: { value: 'test-key' } })
        fireEvent.change(apiSecretInput, { target: { value: 'test-secret' } })
        fireEvent.change(passphraseInput, { target: { value: 'test-phrase' } })
        fireEvent.change(uidInput, { target: { value: 'test-uid' } })
      })

      const submitButton = screen.getByRole('button', { name: /注册.*更新/ })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled()
        // Should not show success message
        expect(screen.queryByText(/注册成功！/)).not.toBeInTheDocument()
        // Form should still be accessible
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('should handle deposit API errors gracefully', async () => {
      const mockDeposit = vi.mocked(api.api.deposit)
      mockDeposit.mockRejectedValue(new Error('Server error'))

      const { container } = render(<Deposit />)

      // Get deposit form inputs by their order
      const inputs = container.querySelectorAll('input')
      const [usernameInput, passwordInput, referenceInput, amountInput] = inputs

      // Fill and submit form
      await act(async () => {
        fireEvent.change(usernameInput, { target: { value: 'test-user' } })
        fireEvent.change(passwordInput, { target: { value: 'test-pass' } })
        fireEvent.change(referenceInput, { target: { value: 'TEST123' } })
        fireEvent.change(amountInput, { target: { value: '100' } })
      })

      const submitButton = screen.getByText(/提交/)
      await act(async () => {
        fireEvent.click(submitButton)
      })

      const confirmButton = screen.getByText(/确认提交/)
      await act(async () => {
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockDeposit).toHaveBeenCalled()
        // Should not show success message
        expect(screen.queryByText(/充值成功！/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Multi-Modal Interaction Flows', () => {
    it('should handle multiple modal interactions in sequence', async () => {
      const { container } = render(<Deposit />)

      // Open and close steps guide
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /查看充值步骤指引/ }))
      })

      expect(screen.getByRole('heading', { name: /充值步骤指引/ })).toBeInTheDocument()

      await act(async () => {
        fireEvent.click(screen.getByText(/我知道了/))
      })

      // Open image preview
      const helpButtons = screen.getAllByText(/查看示例/)
      await act(async () => {
        fireEvent.click(helpButtons[0])
      })

      expect(screen.getByText(/参考编号填写示例/)).toBeInTheDocument()

      await act(async () => {
        fireEvent.click(screen.getByText(/我知道了/))
      })

      // Get deposit form inputs by their order
      const inputs = container.querySelectorAll('input')
      const [usernameInput, passwordInput, referenceInput, amountInput] = inputs

      // Fill form and open confirmation
      await act(async () => {
        fireEvent.change(usernameInput, { target: { value: 'modal-user' } })
        fireEvent.change(passwordInput, { target: { value: 'modal-pass' } })
        fireEvent.change(referenceInput, { target: { value: 'MODAL123' } })
        fireEvent.change(amountInput, { target: { value: '500' } })
        fireEvent.click(screen.getByText(/提交/))
      })

      expect(screen.getByText(/确认充值信息/)).toBeInTheDocument()
    })
  })

  describe('Accessibility Interaction Flows', () => {
    it('should support basic form interaction', async () => {
      const { container } = render(<Register />)

      // Get inputs by their order in the form
      const inputs = container.querySelectorAll('input')
      const [nameInput] = inputs

      // Verify inputs can be focused
      nameInput.focus()
      expect(nameInput).toHaveFocus()

      // Verify inputs can receive values
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test User' } })
      })
      expect(nameInput).toHaveValue('Test User')
    })

    it('should show form validation errors', async () => {
      render(<Register />)

      const submitButton = screen.getByRole('button', { name: /注册.*更新/ })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      // Check that validation error messages appear
      await waitFor(() => {
        expect(screen.getByText('请输入姓名')).toBeInTheDocument()
        expect(screen.getByText('请输入邮箱')).toBeInTheDocument()
        expect(screen.getByText('请输入密码')).toBeInTheDocument()
      })
    })
  })
})