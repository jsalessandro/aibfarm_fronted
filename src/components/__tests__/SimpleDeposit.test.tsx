import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { createMockAxiosResponse } from '@/test/setup'
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

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

describe('Deposit Component - Simplified Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render all form labels', () => {
    render(<Deposit />)

    expect(screen.getByText('用户名')).toBeInTheDocument()
    expect(screen.getByText('密码')).toBeInTheDocument()
    expect(screen.getByText('参考编号')).toBeInTheDocument()
    expect(screen.getByText('金额')).toBeInTheDocument()
  })

  it('should have correct number of input fields', () => {
    const { container } = render(<Deposit />)
    
    const inputs = container.querySelectorAll('input')
    expect(inputs.length).toBe(4) // 4 form fields
  })

  it('should display account number', () => {
    render(<Deposit />)
    
    expect(screen.getByText(/账户号码：3733373495422976/)).toBeInTheDocument()
  })

  it('should copy account number to clipboard', async () => {
    render(<Deposit />)

    const copyButton = screen.getByText(/复制账户号码/)
    
    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('3733373495422976')
  })

  it('should render quick amount buttons', () => {
    render(<Deposit />)

    expect(screen.getByText('100 USDT')).toBeInTheDocument()
    expect(screen.getByText('500 USDT')).toBeInTheDocument()
    expect(screen.getByText('1000 USDT')).toBeInTheDocument()
    expect(screen.getByText('2000 USDT')).toBeInTheDocument()
    expect(screen.getByText('5000 USDT')).toBeInTheDocument()
  })

  it('should set amount when quick amount button is clicked', async () => {
    const { container } = render(<Deposit />)

    const quickAmount1000 = screen.getByText('1000 USDT')
    
    await act(async () => {
      fireEvent.click(quickAmount1000)
    })

    // Get amount input (4th input field)
    const inputs = container.querySelectorAll('input')
    const amountInput = inputs[3]
    
    expect(amountInput).toHaveValue(1000)
  })

  it('should handle form submission', async () => {
    const mockDeposit = vi.mocked(api.api.deposit)
    mockDeposit.mockResolvedValue(createMockAxiosResponse({ success: true }))

    const { container } = render(<Deposit />)
    
    // Get all inputs
    const inputs = container.querySelectorAll('input')
    const [usernameInput, passwordInput, referenceInput, amountInput] = inputs

    // Fill form
    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(passwordInput, { target: { value: 'testpassword' } })
      fireEvent.change(referenceInput, { target: { value: 'REF123456' } })
      fireEvent.change(amountInput, { target: { value: '1000' } })
    })

    // Submit form
    const submitButton = screen.getByText('提交')
    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText(/确认充值信息/)).toBeInTheDocument()
    })

    // Confirm submission
    const confirmButton = screen.getByText('确认提交')
    await act(async () => {
      fireEvent.click(confirmButton)
    })

    // Verify API call
    await waitFor(() => {
      expect(mockDeposit).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpassword',
        referenceCode: 'REF123456',
        amount: 1000,
      })
    })
  })

  it('should show validation errors for empty fields', async () => {
    render(<Deposit />)

    const submitButton = screen.getByText('提交')
    
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
    const { container } = render(<Deposit />)
    
    // Get amount input
    const inputs = container.querySelectorAll('input')
    const amountInput = inputs[3]

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '0' } })
    })

    const submitButton = screen.getByText('提交')
    await act(async () => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('请输入有效金额')).toBeInTheDocument()
    })
  })

  it('should save username to localStorage', async () => {
    const { container } = render(<Deposit />)
    
    // Get username input
    const inputs = container.querySelectorAll('input')
    const usernameInput = inputs[0]

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    })

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('depositUsername', 'testuser')
    })
  })

  it('should load saved username from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('saveduser')

    const { container } = render(<Deposit />)
    
    // Get username input
    const inputs = container.querySelectorAll('input')
    const usernameInput = inputs[0]
    
    expect(usernameInput).toHaveValue('saveduser')
  })

  it('should open steps guide modal', async () => {
    render(<Deposit />)

    const stepsButton = screen.getByRole('button', { name: /查看充值步骤指引/ })
    
    await act(async () => {
      fireEvent.click(stepsButton)
    })

    await waitFor(() => {
      // Use getAllByText since there might be multiple elements with this text
      const elements = screen.getAllByText(/充值步骤指引/)
      expect(elements.length).toBeGreaterThan(0)
      expect(screen.getByText(/复制收款账户/)).toBeInTheDocument()
      expect(screen.getByText(/在OKX进行转账/)).toBeInTheDocument()
    })
  })

  it('should open image preview modal', async () => {
    render(<Deposit />)

    // Find the first "查看示例" button
    const helpButtons = screen.getAllByText(/查看示例/)
    
    await act(async () => {
      fireEvent.click(helpButtons[0])
    })

    await waitFor(() => {
      expect(screen.getByText(/参考编号填写示例/)).toBeInTheDocument()
    })

    // Close modal
    const closeButton = screen.getByText('我知道了')
    await act(async () => {
      fireEvent.click(closeButton)
    })

    await waitFor(() => {
      expect(screen.queryByText(/参考编号填写示例/)).not.toBeInTheDocument()
    })
  })

  it('should handle decimal amounts', async () => {
    const { container } = render(<Deposit />)
    
    // Get amount input
    const inputs = container.querySelectorAll('input')
    const amountInput = inputs[3]

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1000.50' } })
    })

    expect(amountInput).toHaveValue(1000.50)
  })

  it('should show success modal after successful submission', async () => {
    const mockDeposit = vi.mocked(api.api.deposit)
    mockDeposit.mockResolvedValue(createMockAxiosResponse({ success: true }))

    const { container } = render(<Deposit />)
    
    // Fill form with valid data
    const inputs = container.querySelectorAll('input')
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'user' } })
      fireEvent.change(inputs[1], { target: { value: 'pass' } })
      fireEvent.change(inputs[2], { target: { value: 'REF123' } })
      fireEvent.change(inputs[3], { target: { value: '100' } })
    })

    // Submit and confirm
    const submitButton = screen.getByText('提交')
    await act(async () => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/确认充值信息/)).toBeInTheDocument()
    })

    const confirmButton = screen.getByText('确认提交')
    await act(async () => {
      fireEvent.click(confirmButton)
    })

    // Should show success modal
    await waitFor(() => {
      expect(screen.getByText(/充值成功！/)).toBeInTheDocument()
    })
  })
})