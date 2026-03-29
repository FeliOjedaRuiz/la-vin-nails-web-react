import axios from 'axios';

jest.mock('axios', () => {
    const mocked = {
        create: jest.fn(() => mocked),
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
    };
    return mocked;
});

describe('Axios Interceptor Logic', () => {
    let requestHandler;
    let responseHandler;
    let errorHandler;

    beforeEach(() => {
        localStorage.clear();
        
        jest.resetModules();
        const activeAxiosMock = require('axios');
        
        require('../../services/base-api');
        
        // Obtenemos los manejadores de los interceptores del mock activo en este scope
        requestHandler = activeAxiosMock.interceptors.request.use.mock.calls[0][0];
        responseHandler = activeAxiosMock.interceptors.response.use.mock.calls[0][0];
        errorHandler = activeAxiosMock.interceptors.response.use.mock.calls[0][1];
    });

    it('añade Authorization Bearer si hay token', () => {
        localStorage.setItem('user-access-token', 'test-token');
        const config = { headers: {} };
        const result = requestHandler(config);
        expect(result.headers['Authorization']).toBe('Bearer test-token');
    });

    it('devuelve data de la respuesta', () => {
        const response = { data: 'test-data' };
        expect(responseHandler(response)).toBe('test-data');
    });

    it('limpia localStorage en error 401 fuera de login', async () => {
        const originalLocation = window.location;
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { href: 'http://localhost/dashboard', assign: jest.fn() }
        });

        localStorage.setItem('user-access-token', 'expired');
        const error = { response: { status: 401 } };
        
        try {
            await errorHandler(error);
        } catch(e) {
            // No debería rechazar, porque debería limpiar y devolver Promise.resolve()
        }

        expect(localStorage.getItem('user-access-token')).toBeNull();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation
        });
    });
});
