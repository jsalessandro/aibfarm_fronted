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

      render(<Register />)

      // Step 1: Fill basic information
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/名称.*Name/), { 
          target: { value: 'John Doe' } 
        })
        fireEvent.change(screen.getByLabelText(/邮箱.*Email/), { 
          target: { value: 'john.doe@example.com' } 
        })
        fireEvent.change(screen.getByLabelText(/密码.*Password/), { 
          target: { value: 'SecurePassword123' } 
        })
      })

      // Step 2: Fill OKX credentials manually
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/OKX API Key/), { 
          target: { value: 'api-key-12345' } 
        })
        fireEvent.change(screen.getByLabelText(/OKX API Secret/), { 
          target: { value: 'api-secret-67890' } 
        })
        fireEvent.change(screen.getByLabelText(/OKX Passphrase/), { 
          target: { value: 'my-passphrase' } 
        })
        fireEvent.change(screen.getByLabelText(/OKX UID/), { 
          target: { value: 'uid-99999' } 
        })
      })

      // Step 3: Submit form
      const submitButton = screen.getByText(/注册.*更新/)
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

      render(<Register />)

      // Step 1: Fill basic information
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/名称.*Name/), { 
          target: { value: 'Jane Smith' } 
        })
        fireEvent.change(screen.getByLabelText(/邮箱.*Email/), { 
          target: { value: 'jane@example.com' } 
        })
        fireEvent.change(screen.getByLabelText(/密码.*Password/), { 
          target: { value: 'MyPassword456' } 
        })
      })

      // Step 2: Open auto-fill modal
      const autoFillButton = screen.getByText(/快速填充OKX凭据/)
      await act(async () => {
        fireEvent.click(autoFillButton)
      })

      expect(screen.getByText(/粘贴OKX API凭据/)).toBeInTheDocument()

      // Step 3: Paste credentials and auto-fill
      const textarea = screen.getByPlaceholderText(/示例格式/)
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
      await waitFor(() => {
        expect(screen.getByLabelText(/OKX API Key/)).toHaveValue('auto-fill-api-key')
        expect(screen.getByLabelText(/OKX API Secret/)).toHaveValue('auto-fill-secret-key')
        expect(screen.getByLabelText(/OKX Passphrase/)).toHaveValue('auto-fill-passphrase')
        expect(screen.getByLabelText(/OKX UID/)).toHaveValue('auto-fill-uid')
      })

      // Step 5: Submit form
      const submitButton = screen.getByText(/注册.*更新/)
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

      render(<Register />)

      // Verify data was loaded
      expect(screen.getByLabelText(/名称.*Name/)).toHaveValue('Persisted User')
      expect(screen.getByLabelText(/邮箱.*Email/)).toHaveValue('persisted@example.com')
      expect(screen.getByLabelText(/OKX API Key/)).toHaveValue('persisted-key')

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

      render(<Deposit />)

      // Step 1: Copy account number
      const copyButton = screen.getByText(/复制账户号码/)
      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('3733373495422976')

      // Step 2: View steps guide
      const stepsButton = screen.getByText(/查看充值步骤指引/)
      await act(async () => {
        fireEvent.click(stepsButton)
      })

      expect(screen.getByText(/充值步骤指引/)).toBeInTheDocument()

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

      // Step 4: Fill deposit form
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/用户名/), { 
          target: { value: 'depositor123' } 
        })
        fireEvent.change(screen.getByLabelText(/密码/), { 
          target: { value: 'deposit-password' } 
        })
        fireEvent.change(screen.getByLabelText(/参考编号/), { 
          target: { value: 'DEP20240301001' } 
        })
      })

      // Step 5: Use quick amount selection
      const quickAmount1000 = screen.getByText('1000 USDT')
      await act(async () => {
        fireEvent.click(quickAmount1000)
      })

      expect(screen.getByLabelText(/金额/)).toHaveValue(1000)

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

      render(<Deposit />)

      // Fill form with custom amount
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/用户名/), { 
          target: { value: 'custom-user' } 
        })
        fireEvent.change(screen.getByLabelText(/密码/), { 
          target: { value: 'custom-pass' } 
        })
        fireEvent.change(screen.getByLabelText(/参考编号/), { 
          target: { value: 'CUSTOM123' } 
        })
        fireEvent.change(screen.getByLabelText(/金额/), { 
          target: { value: '2550.75' } 
        })
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
      const { unmount } = render(<Deposit />)

      await act(async () => {
        fireEvent.change(screen.getByLabelText(/用户名/), { 
          target: { value: 'persistent-user' } 
        })
      })

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('depositUsername', 'persistent-user')
      })

      unmount()

      // Mock the saved username
      mockLocalStorage.getItem.mockReturnValue('persistent-user')

      // Second render - should load saved username
      render(<Deposit />)

      expect(screen.getByLabelText(/用户名/)).toHaveValue('persistent-user')
      expect(screen.getByText(/已记住/)).toBeInTheDocument()
    })
  })

  describe('Error Handling Flows', () => {
    it('should handle registration API errors gracefully', async () => {
      const mockRegister = vi.mocked(api.api.register)
      mockRegister.mockRejectedValue(new Error('Network error'))

      render(<Register />)

      // Fill form with valid data
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/名称.*Name/), { target: { value: 'Test User' } })
        fireEvent.change(screen.getByLabelText(/邮箱.*Email/), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByLabelText(/密码.*Password/), { target: { value: 'password123' } })
        fireEvent.change(screen.getByLabelText(/OKX API Key/), { target: { value: 'test-key' } })
        fireEvent.change(screen.getByLabelText(/OKX API Secret/), { target: { value: 'test-secret' } })
        fireEvent.change(screen.getByLabelText(/OKX Passphrase/), { target: { value: 'test-phrase' } })
        fireEvent.change(screen.getByLabelText(/OKX UID/), { target: { value: 'test-uid' } })
      })

      const submitButton = screen.getByText(/注册.*更新/)
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

      render(<Deposit />)

      // Fill and submit form
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/用户名/), { target: { value: 'test-user' } })
        fireEvent.change(screen.getByLabelText(/密码/), { target: { value: 'test-pass' } })
        fireEvent.change(screen.getByLabelText(/参考编号/), { target: { value: 'TEST123' } })
        fireEvent.change(screen.getByLabelText(/金额/), { target: { value: '100' } })
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
      render(<Deposit />)

      // Open and close steps guide
      await act(async () => {
        fireEvent.click(screen.getByText(/查看充值步骤指引/))
      })

      expect(screen.getByText(/充值步骤指引/)).toBeInTheDocument()

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

      // Fill form and open confirmation
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/用户名/), { target: { value: 'modal-user' } })
        fireEvent.change(screen.getByLabelText(/密码/), { target: { value: 'modal-pass' } })
        fireEvent.change(screen.getByLabelText(/参考编号/), { target: { value: 'MODAL123' } })
        fireEvent.change(screen.getByLabelText(/金额/), { target: { value: '500' } })
        fireEvent.click(screen.getByText(/提交/))
      })

      expect(screen.getByText(/确认充值信息/)).toBeInTheDocument()
    })
  })

  describe('Accessibility Interaction Flows', () => {
    it('should support keyboard navigation through form', async () => {
      render(<Register />)

      const nameInput = screen.getByLabelText(/名称.*Name/)
      const emailInput = screen.getByLabelText(/邮箱.*Email/)
      const passwordInput = screen.getByLabelText(/密码.*Password/)

      // Start at name field
      nameInput.focus()
      expect(nameInput).toHaveFocus()

      // Tab through fields
      await act(async () => {
        fireEvent.keyDown(nameInput, { key: 'Tab' })
      })
      expect(emailInput).toHaveFocus()

      await act(async () => {
        fireEvent.keyDown(emailInput, { key: 'Tab' })
      })
      expect(passwordInput).toHaveFocus()
    })

    it('should announce form errors to screen readers', async () => {
      render(<Register />)

      const submitButton = screen.getByText(/注册.*更新/)
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        const errorElements = screen.getAllByRole('alert', { hidden: true })
        expect(errorElements.length).toBeGreaterThan(0)
      })
    })
  })
})