import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'
import type { AxiosResponse } from 'axios'

// Helper function to create mock AxiosResponse
export const createMockAxiosResponse = <T = unknown>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as AxiosResponse['config'],
})

// Mock axios globally
vi.mock('axios', () => ({
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
}))

// Mock framer-motion
vi.mock('framer-motion', () => {
  const mockMotionComponent = (Component: string) => {
    const MotionComponent = React.forwardRef(({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }, ref: React.Ref<HTMLElement>) => {
      // Filter out motion-specific props to avoid React warnings
      const { 
        initial: _initial, 
        animate: _animate, 
        exit: _exit, 
        transition: _transition, 
        whileHover: _whileHover, 
        whileTap: _whileTap, 
        whileFocus: _whileFocus, 
        whileInView: _whileInView, 
        variants: _variants, 
        drag: _drag, 
        dragConstraints: _dragConstraints,
        ...cleanProps 
      } = props;
      return React.createElement(Component, { ...cleanProps, ref }, children);
    });
    MotionComponent.displayName = `Motion${Component}`;
    return MotionComponent;
  };

  return {
    motion: {
      div: mockMotionComponent('div'),
      button: mockMotionComponent('button'),
      form: mockMotionComponent('form'),
      h1: mockMotionComponent('h1'),
      p: mockMotionComponent('p'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
})

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})