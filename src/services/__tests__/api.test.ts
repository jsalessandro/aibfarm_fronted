import { describe, it, expect, vi } from 'vitest'
import { api } from '../api'

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    create: vi.fn(() => ({
      post: vi.fn(),
    })),
  },
}))

describe('API Service', () => {
  it('has register function', () => {
    expect(typeof api.register).toBe('function')
  })

  it('has deposit function', () => {
    expect(typeof api.deposit).toBe('function')
  })

  it('api object is properly structured', () => {
    expect(api).toHaveProperty('register')
    expect(api).toHaveProperty('deposit')
  })
})