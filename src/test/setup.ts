import '@testing-library/jest-dom'
import React from 'react'

// Mock framer-motion
vi.mock('framer-motion', () => {
  const mockMotionComponent = (Component: string) => 
    React.forwardRef(({ children, ...props }: any, ref: any) => {
      // Filter out motion-specific props to avoid React warnings
      const { 
        initial, animate, exit, transition, whileHover, whileTap, 
        whileFocus, whileInView, variants, drag, dragConstraints,
        ...cleanProps 
      } = props;
      return React.createElement(Component, { ...cleanProps, ref }, children);
    });

  return {
    motion: {
      div: mockMotionComponent('div'),
      button: mockMotionComponent('button'),
      form: mockMotionComponent('form'),
      h1: mockMotionComponent('h1'),
      p: mockMotionComponent('p'),
    },
    AnimatePresence: ({ children }: any) => children,
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