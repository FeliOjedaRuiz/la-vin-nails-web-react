// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

jest.mock('axios', () => {
    const mocked = {
        create: jest.fn(() => mocked),
        get: jest.fn(() => Promise.resolve({ data: {} })),
        post: jest.fn(() => Promise.resolve({ data: {} })),
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
    };
    return mocked;
});

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }),
});

// Mock de offsetWidth para JSDOM (necesario para WeekCarousel)
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 500 });
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 500 });



