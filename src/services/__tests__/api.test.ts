import { describe, it, expect, vi, beforeAll } from 'vitest'

// Mock axios before importing api
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        post: vi.fn(() => Promise.resolve({ data: { success: true } })),
        get: vi.fn(() => Promise.resolve({ data: { success: true } })),
        put: vi.fn(() => Promise.resolve({ data: { success: true } })),
        delete: vi.fn(() => Promise.resolve({ data: { success: true } })),
        interceptors: {
          request: {
            use: vi.fn(),
          },
          response: {
            use: vi.fn(),
          },
        },
      })),
    },
  }
})

describe('API Service', () => {
  let api: typeof import('../api').api
  
  beforeAll(async () => {
    // Import api after mocking axios
    const module = await import('../api')
    api = module.api
  })
  
  it('has register function', () => {
    expect(typeof api.register).toBe('function')
  })

  it('has deposit function', () => {
    expect(typeof api.deposit).toBe('function')
  })

  it('has login function', () => {
    expect(typeof api.login).toBe('function')
  })

  it('has logout function', () => {
    expect(typeof api.logout).toBe('function')
  })

  it('api object is properly structured', () => {
    expect(api).toHaveProperty('register')
    expect(api).toHaveProperty('deposit')
    expect(api).toHaveProperty('login')
    expect(api).toHaveProperty('logout')
    expect(api).toHaveProperty('getProfile')
    expect(api).toHaveProperty('getBalance')
  })
})