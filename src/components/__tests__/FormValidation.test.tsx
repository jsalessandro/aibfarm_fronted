import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { act } from '@testing-library/react'
import Register from '../Register'
import Deposit from '../Deposit'

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

describe('Form Validation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Register Form Validation', () => {
    it('should validate all required fields together', async () => {
      render(<Register />)

      const submitButton = screen.getByText(/注册.*更新/)

      await act(async () => {
        fireEvent.click(submitButton)
      })

      // Wait for all validation errors to appear
      await waitFor(() => {
        expect(screen.getByText('请输入姓名')).toBeInTheDocument()
        expect(screen.getByText('请输入邮箱')).toBeInTheDocument()
        expect(screen.getByText('请输入密码')).toBeInTheDocument()
        expect(screen.getByText('请输入OKX API Key')).toBeInTheDocument()
        expect(screen.getByText('请输入OKX API Secret')).toBeInTheDocument()
        expect(screen.getByText('请输入OKX Passphrase')).toBeInTheDocument()
        expect(screen.getByText('请输入OKX UID')).toBeInTheDocument()
      })

      // Count total error messages
      const errorMessages = screen.getAllByText(/请输入/)
      expect(errorMessages).toHaveLength(7)
    })

    it('should progressively validate fields as user fills them', async () => {
      render(<Register />)

      const nameInput = screen.getByLabelText(/名称.*Name/)
      const emailInput = screen.getByLabelText(/邮箱.*Email/)
      const submitButton = screen.getByText(/注册.*更新/)

      // First submission - all errors
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('请输入姓名')).toBeInTheDocument()
        expect(screen.getByText('请输入邮箱')).toBeInTheDocument()
      })

      // Fill name field
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test User' } })
      })

      await waitFor(() => {
        expect(screen.queryByText('请输入姓名')).not.toBeInTheDocument()
        expect(screen.getByText('请输入邮箱')).toBeInTheDocument() // Still there
      })

      // Fill email with invalid format
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.queryByText('请输入姓名')).not.toBeInTheDocument()
        expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument()
      })

      // Fix email format
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })

      await waitFor(() => {
        expect(screen.queryByText('请输入有效的邮箱地址')).not.toBeInTheDocument()
      })
    })

    it('should handle complex email validation scenarios', async () => {
      render(<Register />)

      const emailInput = screen.getByLabelText(/邮箱.*Email/)
      const submitButton = screen.getByText(/注册.*更新/)

      const invalidEmails = [
        'plainaddress',
        '@missingdomain.com',
        'missing@.com',
        'missing@domain',
        'spaces @domain.com',
        'multiple@@domain.com',
        'trailing.dot.@domain.com',
        'leading.dot@.domain.com',
      ]

      for (const invalidEmail of invalidEmails) {
        await act(async () => {
          fireEvent.change(emailInput, { target: { value: invalidEmail } })
          fireEvent.click(submitButton)
        })

        await waitFor(() => {
          expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument()
        })
      }

      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
        'firstname-lastname@domain-name.com',
        'numbers123@example.net',
      ]

      for (const validEmail of validEmails) {
        await act(async () => {
          fireEvent.change(emailInput, { target: { value: validEmail } })
          fireEvent.blur(emailInput)
        })

        await waitFor(() => {
          expect(screen.queryByText('请输入有效的邮箱地址')).not.toBeInTheDocument()
        })
      }
    })

    it('should validate field length constraints', async () => {
      render(<Register />)

      const nameInput = screen.getByLabelText(/名称.*Name/)

      // Test very long name (beyond reasonable limits)
      const longName = 'A'.repeat(1000)
      
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: longName } })
      })

      expect(nameInput).toHaveValue(longName)
    })

    it('should handle special characters in input fields', async () => {
      render(<Register />)

      const nameInput = screen.getByLabelText(/名称.*Name/)
      const emailInput = screen.getByLabelText(/邮箱.*Email/)
      const apiKeyInput = screen.getByLabelText(/OKX API Key/)

      const specialCharacters = {
        name: 'Test User 测试用户 !@#$%^&*()',
        email: 'test+special.chars@example-domain.com',
        apiKey: 'abcd-1234-efgh-5678-ijkl',
      }

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: specialCharacters.name } })
        fireEvent.change(emailInput, { target: { value: specialCharacters.email } })
        fireEvent.change(apiKeyInput, { target: { value: specialCharacters.apiKey } })
      })

      expect(nameInput).toHaveValue(specialCharacters.name)
      expect(emailInput).toHaveValue(specialCharacters.email)
      expect(apiKeyInput).toHaveValue(specialCharacters.apiKey)
    })
  })

  describe('Deposit Form Validation', () => {
    it('should validate all required fields together', async () => {
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

      const errorMessages = screen.getAllByText(/请输入/)
      expect(errorMessages).toHaveLength(4)
    })

    it('should validate amount field constraints', async () => {
      render(<Deposit />)

      const amountInput = screen.getByLabelText(/金额/)
      const submitButton = screen.getByText(/提交/)

      // Test zero amount
      await act(async () => {
        fireEvent.change(amountInput, { target: { value: '0' } })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('请输入有效金额')).toBeInTheDocument()
      })

      // Test negative amount
      await act(async () => {
        fireEvent.change(amountInput, { target: { value: '-100' } })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('请输入有效金额')).toBeInTheDocument()
      })

      // Test valid amounts
      const validAmounts = ['1', '100', '1000.50', '99999.99']
      
      for (const amount of validAmounts) {
        await act(async () => {
          fireEvent.change(amountInput, { target: { value: amount } })
        })

        await waitFor(() => {
          expect(screen.queryByText('请输入有效金额')).not.toBeInTheDocument()
        })
      }
    })

    it('should handle decimal precision in amounts', async () => {
      render(<Deposit />)

      const amountInput = screen.getByLabelText(/金额/)

      const testCases = [
        { input: '1000.5', expected: 1000.5 },
        { input: '1000.50', expected: 1000.5 },
        { input: '1000.123456', expected: 1000.123456 },
        { input: '0.01', expected: 0.01 },
        { input: '999999.99', expected: 999999.99 },
      ]

      for (const testCase of testCases) {
        await act(async () => {
          fireEvent.change(amountInput, { target: { value: testCase.input } })
        })

        expect(amountInput).toHaveValue(testCase.expected)
      }
    })

    it('should validate reference code format', async () => {
      render(<Deposit />)

      const referenceInput = screen.getByLabelText(/参考编号/)

      const validReferenceCodes = [
        'REF123456',
        'TXN-2024-001',
        'DEPOSIT_001',
        '2024030112345',
        'ABC123DEF456',
      ]

      for (const refCode of validReferenceCodes) {
        await act(async () => {
          fireEvent.change(referenceInput, { target: { value: refCode } })
        })

        expect(referenceInput).toHaveValue(refCode)
      }
    })
  })

  describe('Cross-Field Validation', () => {
    it('should maintain validation state when switching between fields', async () => {
      render(<Register />)

      const nameInput = screen.getByLabelText(/名称.*Name/)
      const emailInput = screen.getByLabelText(/邮箱.*Email/)
      const submitButton = screen.getByText(/注册.*更新/)

      // Trigger validation
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('请输入姓名')).toBeInTheDocument()
        expect(screen.getByText('请输入邮箱')).toBeInTheDocument()
      })

      // Fill name field
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test User' } })
      })

      // Focus and blur email without filling
      await act(async () => {
        fireEvent.focus(emailInput)
        fireEvent.blur(emailInput)
      })

      await waitFor(() => {
        expect(screen.queryByText('请输入姓名')).not.toBeInTheDocument()
        expect(screen.getByText('请输入邮箱')).toBeInTheDocument()
      })
    })
  })

  describe('Error Message Accessibility', () => {
    it('should provide accessible error messages', async () => {
      render(<Register />)

      const emailInput = screen.getByLabelText(/邮箱.*Email/)
      const submitButton = screen.getByText(/注册.*更新/)

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid' } })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        const errorMessage = screen.getByText('请输入有效的邮箱地址')
        expect(errorMessage).toBeInTheDocument()
        
        // Check that error message is associated with input
        const errorElement = errorMessage.closest('[role="alert"], .error, [id*="error"]')
        expect(errorElement).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Validation', () => {
    it('should validate fields in real-time as user types', async () => {
      render(<Register />)

      const emailInput = screen.getByLabelText(/邮箱.*Email/)
      const submitButton = screen.getByText(/注册.*更新/)

      // First trigger validation by submitting
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('请输入邮箱')).toBeInTheDocument()
      })

      // Start typing invalid email
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test' } })
      })

      // Error should update to format error
      await waitFor(() => {
        expect(screen.queryByText('请输入邮箱')).not.toBeInTheDocument()
      })

      // Complete valid email
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })

      await waitFor(() => {
        expect(screen.queryByText('请输入有效的邮箱地址')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form State Persistence', () => {
    it('should handle form state correctly during validation', async () => {
      render(<Register />)

      const nameInput = screen.getByLabelText(/名称.*Name/)
      const emailInput = screen.getByLabelText(/邮箱.*Email/)

      // Fill some fields
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test User' } })
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })

      // Values should persist even after validation
      const submitButton = screen.getByText(/注册.*更新/)
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(nameInput).toHaveValue('Test User')
      expect(emailInput).toHaveValue('test@example.com')
    })
  })
})