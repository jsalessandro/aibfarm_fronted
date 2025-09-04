import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { act } from '@testing-library/react'
import Deposit from '../Deposit'
import * as api from '@/services/api'

// Mock API
vi.mock('@/services/api', () => ({
  api: {
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

describe('Deposit Component - Input Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Input Fields', () => {
    it('should render all required input fields', () => {
      render(<Deposit />)

      expect(screen.getByLabelText(/用户名/)).toBeInTheDocument()
      expect(screen.getByLabelText(/密码/)).toBeInTheDocument()
      expect(screen.getByLabelText(/参考编号/)).toBeInTheDocument()
      expect(screen.getByLabelText(/金额/)).toBeInTheDocument()
    })

    it('should have correct input types for each field', () => {
      render(<Deposit />)

      expect(screen.getByLabelText(/用户名/)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/密码/)).toHaveAttribute('type', 'password')
      expect(screen.getByLabelText(/参考编号/)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/金额/)).toHaveAttribute('type', 'number')
    })

    it('should accept user input in all fields', async () => {
      render(<Deposit />)

      const usernameInput = screen.getByLabelText(/用户名/)
      const passwordInput = screen.getByLabelText(/密码/)
      const referenceInput = screen.getByLabelText(/参考编号/)
      const amountInput = screen.getByLabelText(/金额/)

      await act(async () => {
        fireEvent.change(usernameInput, { target: { value: 'testuser' } })
        fireEvent.change(passwordInput, { target: { value: 'testpassword' } })
        fireEvent.change(referenceInput, { target: { value: 'REF123456' } })
        fireEvent.change(amountInput, { target: { value: '1000' } })
      })

      expect(usernameInput).toHaveValue('testuser')
      expect(passwordInput).toHaveValue('testpassword')
      expect(referenceInput).toHaveValue('REF123456')
      expect(amountInput).toHaveValue(1000)
    })

    it('should handle decimal amounts', async () => {
      render(<Deposit />)

      const amountInput = screen.getByLabelText(/金额/)

      await act(async () => {
        fireEvent.change(amountInput, { target: { value: '1000.50' } })
      })

      expect(amountInput).toHaveValue(1000.50)
    })
  })

  describe('Quick Amount Selection', () => {
    it('should render quick amount buttons', () => {
      render(<Deposit />)

      expect(screen.getByText('100 USDT')).toBeInTheDocument()
      expect(screen.getByText('500 USDT')).toBeInTheDocument()
      expect(screen.getByText('1000 USDT')).toBeInTheDocument()
      expect(screen.getByText('2000 USDT')).toBeInTheDocument()
      expect(screen.getByText('5000 USDT')).toBeInTheDocument()
    })

    it('should set amount when quick amount button is clicked', async () => {
      render(<Deposit />)

      const quickAmount1000 = screen.getByText('1000 USDT')
      const amountInput = screen.getByLabelText(/金额/)

      await act(async () => {
        fireEvent.click(quickAmount1000)
      })

      expect(amountInput).toHaveValue(1000)
    })

    it('should highlight selected quick amount', async () => {
      render(<Deposit />)

      const quickAmount500 = screen.getByText('500 USDT')

      await act(async () => {
        fireEvent.click(quickAmount500)
      })

      expect(quickAmount500).toHaveClass('bg-green-500')
    })

    it('should update highlighting when different amount is selected', async () => {
      render(<Deposit />)

      const quickAmount500 = screen.getByText('500 USDT')
      const quickAmount1000 = screen.getByText('1000 USDT')

      await act(async () => {
        fireEvent.click(quickAmount500)
      })

      expect(quickAmount500).toHaveClass('bg-green-500')

      await act(async () => {
        fireEvent.click(quickAmount1000)
      })

      expect(quickAmount1000).toHaveClass('bg-green-500')
      expect(quickAmount500).not.toHaveClass('bg-green-500')
    })
  })

  describe('Account Number Copy Functionality', () => {
    it('should copy account number to clipboard when copy button is clicked', async () => {
      render(<Deposit />)

      const copyButton = screen.getByText(/复制账户号码/)

      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('3733373495422976')
    })

    it('should display account number', () => {
      render(<Deposit />)

      expect(screen.getByText(/账户号码：3733373495422976/)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      render(<Deposit />)

      const submitButton = screen.getByText(/提交/)

      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('请输入用户名')).toBeInTheDocument()
        expect(screen.getByText('请输入密码')).toBeInTheDocument()
        expect(screen.getByText('请输入参考编号')).toBeInTheDocument()
        expect(screen.getByText('请输入有效金额')).toBeInTheDocument()
      })
    })

    it('should validate amount is greater than zero', async () => {
      render(<Deposit />)

      const amountInput = screen.getByLabelText(/金额/)
      const submitButton = screen.getByText(/提交/)

      await act(async () => {
        fireEvent.change(amountInput, { target: { value: '0' } })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('请输入有效金额')).toBeInTheDocument()
      })
    })

    it('should clear validation errors when valid input is provided', async () => {
      render(<Deposit />)

      const usernameInput = screen.getByLabelText(/用户名/)
      const submitButton = screen.getByText(/提交/)

      // Trigger validation error
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('请输入用户名')).toBeInTheDocument()
      })

      // Provide valid input
      await act(async () => {
        fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      })

      await waitFor(() => {
        expect(screen.queryByText('请输入用户名')).not.toBeInTheDocument()
      })
    })
  })

  describe('Image Preview Functionality', () => {
    it('should show image preview buttons for reference and amount fields', () => {
      render(<Deposit />)

      // Check for help buttons
      const referenceHelpButtons = screen.getAllByText(/查看示例/)
      expect(referenceHelpButtons).toHaveLength(2) // One for reference, one for amount
    })

    it('should open image modal when help button is clicked', async () => {
      render(<Deposit />)

      const referenceHelpButton = screen.getAllByText(/查看示例/)[0]

      await act(async () => {
        fireEvent.click(referenceHelpButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/参考编号填写示例/)).toBeInTheDocument()
        expect(screen.getByText(/在转账时在备注页面写入此参考编号/)).toBeInTheDocument()
      })
    })

    it('should close image modal when close button is clicked', async () => {
      render(<Deposit />)

      const referenceHelpButton = screen.getAllByText(/查看示例/)[0]

      await act(async () => {
        fireEvent.click(referenceHelpButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/参考编号填写示例/)).toBeInTheDocument()
      })

      const closeButton = screen.getByText(/我知道了/)
      await act(async () => {
        fireEvent.click(closeButton)
      })

      await waitFor(() => {
        expect(screen.queryByText(/参考编号填写示例/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Steps Guide Modal', () => {
    it('should open steps guide when button is clicked', async () => {
      render(<Deposit />)

      const stepsButton = screen.getByText(/查看充值步骤指引/)

      await act(async () => {
        fireEvent.click(stepsButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/充值步骤指引/)).toBeInTheDocument()
        expect(screen.getByText(/复制收款账户/)).toBeInTheDocument()
        expect(screen.getByText(/在OKX进行转账/)).toBeInTheDocument()
      })
    })

    it('should expand step details when step is clicked', async () => {
      render(<Deposit />)

      const stepsButton = screen.getByText(/查看充值步骤指引/)

      await act(async () => {
        fireEvent.click(stepsButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/充值步骤指引/)).toBeInTheDocument()
      })

      // Click on first step to expand
      const firstStep = screen.getByText(/复制收款账户/)
      await act(async () => {
        fireEvent.click(firstStep.closest('[role="button"], div'))
      })

      await waitFor(() => {
        expect(screen.getByText(/账户号码：3733373495422976/)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should show confirmation dialog when form is submitted with valid data', async () => {
      render(<Deposit />)

      // Fill all fields
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/用户名/), { target: { value: 'testuser' } })
        fireEvent.change(screen.getByLabelText(/密码/), { target: { value: 'testpassword' } })
        fireEvent.change(screen.getByLabelText(/参考编号/), { target: { value: 'REF123456' } })
        fireEvent.change(screen.getByLabelText(/金额/), { target: { value: '1000' } })
      })

      const submitButton = screen.getByText(/提交/)
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/确认充值信息/)).toBeInTheDocument()
        expect(screen.getByText('testuser')).toBeInTheDocument()
        expect(screen.getByText('REF123456')).toBeInTheDocument()
        expect(screen.getByText('1000 USDT')).toBeInTheDocument()
      })
    })

    it('should call API when confirmation dialog is confirmed', async () => {
      const mockDeposit = vi.mocked(api.api.deposit)
      mockDeposit.mockResolvedValue({ data: { success: true } })

      render(<Deposit />)

      // Fill all fields
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/用户名/), { target: { value: 'testuser' } })
        fireEvent.change(screen.getByLabelText(/密码/), { target: { value: 'testpassword' } })
        fireEvent.change(screen.getByLabelText(/参考编号/), { target: { value: 'REF123456' } })
        fireEvent.change(screen.getByLabelText(/金额/), { target: { value: '1000' } })
      })

      const submitButton = screen.getByText(/提交/)
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/确认充值信息/)).toBeInTheDocument()
      })

      const confirmButton = screen.getByText(/确认提交/)
      await act(async () => {
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockDeposit).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'testpassword',
          referenceCode: 'REF123456',
          amount: 1000,
        })
      })
    })

    it('should show success modal after successful submission', async () => {
      const mockDeposit = vi.mocked(api.api.deposit)
      mockDeposit.mockResolvedValue({ data: { success: true } })

      render(<Deposit />)

      // Fill all fields and submit
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/用户名/), { target: { value: 'testuser' } })
        fireEvent.change(screen.getByLabelText(/密码/), { target: { value: 'testpassword' } })
        fireEvent.change(screen.getByLabelText(/参考编号/), { target: { value: 'REF123456' } })
        fireEvent.change(screen.getByLabelText(/金额/), { target: { value: '1000' } })
      })

      const submitButton = screen.getByText(/提交/)
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/确认充值信息/)).toBeInTheDocument()
      })

      const confirmButton = screen.getByText(/确认提交/)
      await act(async () => {
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/充值成功！/)).toBeInTheDocument()
        expect(screen.getByText(/您已成功提交充值申请/)).toBeInTheDocument()
      })
    })

    it('should disable submit button during loading', async () => {
      const mockDeposit = vi.mocked(api.api.deposit)
      mockDeposit.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<Deposit />)

      // Fill all fields and submit
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/用户名/), { target: { value: 'testuser' } })
        fireEvent.change(screen.getByLabelText(/密码/), { target: { value: 'testpassword' } })
        fireEvent.change(screen.getByLabelText(/参考编号/), { target: { value: 'REF123456' } })
        fireEvent.change(screen.getByLabelText(/金额/), { target: { value: '1000' } })
      })

      const submitButton = screen.getByText(/提交/)
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/确认充值信息/)).toBeInTheDocument()
      })

      const confirmButton = screen.getByText(/确认提交/)
      await act(async () => {
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/提交中.../)).toBeInTheDocument()
        expect(confirmButton).toBeDisabled()
      })
    })
  })

  describe('Local Storage Integration', () => {
    it('should save username to localStorage', async () => {
      render(<Deposit />)

      const usernameInput = screen.getByLabelText(/用户名/)

      await act(async () => {
        fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      })

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('depositUsername', 'testuser')
      })
    })

    it('should load saved username from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('saveduser')

      render(<Deposit />)

      expect(screen.getByLabelText(/用户名/)).toHaveValue('saveduser')
    })

    it('should show "已记住" indicator when username is saved', () => {
      mockLocalStorage.getItem.mockReturnValue('saveduser')

      render(<Deposit />)

      expect(screen.getByText(/已记住/)).toBeInTheDocument()
    })
  })

  describe('Input Trimming', () => {
    it('should trim whitespace from inputs on submission', async () => {
      const mockDeposit = vi.mocked(api.api.deposit)
      mockDeposit.mockResolvedValue({ data: { success: true } })

      render(<Deposit />)

      // Fill fields with leading/trailing spaces
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/用户名/), { target: { value: '  testuser  ' } })
        fireEvent.change(screen.getByLabelText(/密码/), { target: { value: '  testpassword  ' } })
        fireEvent.change(screen.getByLabelText(/参考编号/), { target: { value: '  REF123456  ' } })
        fireEvent.change(screen.getByLabelText(/金额/), { target: { value: '1000' } })
      })

      const submitButton = screen.getByText(/提交/)
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/确认充值信息/)).toBeInTheDocument()
      })

      const confirmButton = screen.getByText(/确认提交/)
      await act(async () => {
        fireEvent.click(confirmButton)
      })

      await waitFor(() => {
        expect(mockDeposit).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'testpassword', 
          referenceCode: 'REF123456',
          amount: 1000,
        })
      })
    })
  })

  describe('Input Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<Deposit />)

      expect(screen.getByLabelText(/用户名/)).toBeInTheDocument()
      expect(screen.getByLabelText(/密码/)).toBeInTheDocument()
      expect(screen.getByLabelText(/参考编号/)).toBeInTheDocument()
      expect(screen.getByLabelText(/金额/)).toBeInTheDocument()
    })

    it('should have proper attributes for number input', () => {
      render(<Deposit />)

      const amountInput = screen.getByLabelText(/金额/)
      expect(amountInput).toHaveAttribute('type', 'number')
      expect(amountInput).toHaveAttribute('min', '0')
      expect(amountInput).toHaveAttribute('step', '0.01')
    })

    it('should provide helpful hints for inputs', () => {
      render(<Deposit />)

      expect(screen.getByText(/💡 操作提示：转账备注中写入此参考编号/)).toBeInTheDocument()
      expect(screen.getByText(/💰 金额提示：在OKX页面选择USDT对应账户/)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockDeposit = vi.mocked(api.api.deposit)
      mockDeposit.mockRejectedValue(new Error('Network error'))

      render(<Deposit />)

      // Fill all fields and submit
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/用户名/), { target: { value: 'testuser' } })
        fireEvent.change(screen.getByLabelText(/密码/), { target: { value: 'testpassword' } })
        fireEvent.change(screen.getByLabelText(/参考编号/), { target: { value: 'REF123456' } })
        fireEvent.change(screen.getByLabelText(/金额/), { target: { value: '1000' } })
      })

      const submitButton = screen.getByText(/提交/)
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/确认充值信息/)).toBeInTheDocument()
      })

      const confirmButton = screen.getByText(/确认提交/)
      await act(async () => {
        fireEvent.click(confirmButton)
      })

      // Should handle error without crashing
      await waitFor(() => {
        expect(mockDeposit).toHaveBeenCalled()
      })
    })
  })
})