const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const dbHandler = require('./db-handler');

process.env.JWT_SECRET = 'test-secret-key';

const secureMid = require('../middlewares/secure.mid');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Middleware de Autenticación (secure.mid)', () => {
  let testUser;
  let validToken;

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Test',
      surname: 'User',
      phone: 600000000,
      email: 'test@test.com',
      password: 'test1234',
    });

    validToken = jwt.sign(
      { sub: testUser.id, exp: Math.floor(Date.now() / 1000) + 3600 },
      process.env.JWT_SECRET
    );
  });

  describe('auth', () => {
    it('llama a next() y asigna req.user con token válido', (done) => {
      const req = {
        headers: { authorization: `Bearer ${validToken}` },
      };
      const res = {};
      const next = (err) => {
        expect(err).toBeUndefined();
        expect(req.user).toBeDefined();
        expect(req.user.email).toBe('test@test.com');
        done();
      };
      secureMid.auth(req, res, next);
    });

    it('devuelve 401 si no hay token', (done) => {
      const req = { headers: {} };
      const res = {};
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(401);
        done();
      };
      secureMid.auth(req, res, next);
    });

    it('devuelve 401 con token inválido', (done) => {
      const req = {
        headers: { authorization: 'Bearer token-falso-corrupto' },
      };
      const res = {};
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(401);
        done();
      };
      secureMid.auth(req, res, next);
    });
  });

  describe('isAdmin', () => {
    it('permite pasar a un usuario admin', async () => {
      const adminUser = await User.create({
        name: 'Admin',
        surname: 'Boss',
        phone: 600000001,
        email: 'admin@test.com',
        password: 'admin1234',
        role: 'admin',
      });

      const adminToken = jwt.sign(
        { sub: adminUser.id, exp: Math.floor(Date.now() / 1000) + 3600 },
        process.env.JWT_SECRET
      );

      return new Promise((resolve) => {
        const req = {
          headers: { authorization: `Bearer ${adminToken}` },
        };
        const res = {};
        const next = (err) => {
          expect(err).toBeUndefined();
          expect(req.user.role).toBe('admin');
          resolve();
        };
        secureMid.isAdmin(req, res, next);
      });
    });

    it('rechaza a un usuario guest', (done) => {
      const req = {
        headers: { authorization: `Bearer ${validToken}` },
      };
      const res = {};
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(401);
        done();
      };
      secureMid.isAdmin(req, res, next);
    });
  });

  describe('optionalAuth', () => {
    it('llama a next() sin error y req.user es undefined cuando no hay token', (done) => {
      const req = { headers: {} };
      const res = {};
      const next = (err) => {
        expect(err).toBeUndefined();
        expect(req.user).toBeUndefined();
        done();
      };
      secureMid.optionalAuth(req, res, next);
    });

    it('llama a next() y asigna req.user con token válido', (done) => {
      const req = {
        headers: { authorization: `Bearer ${validToken}` },
      };
      const res = {};
      const next = (err) => {
        expect(err).toBeUndefined();
        expect(req.user).toBeDefined();
        expect(req.user.email).toBe('test@test.com');
        done();
      };
      secureMid.optionalAuth(req, res, next);
    });

    it('llama a next() sin error con token inválido (req.user queda undefined)', (done) => {
      const req = {
        headers: { authorization: 'Bearer token-falso' },
      };
      const res = {};
      const next = (err) => {
        expect(err).toBeUndefined();
        expect(req.user).toBeUndefined();
        done();
      };
      secureMid.optionalAuth(req, res, next);
    });
  });

  describe('cleanBody', () => {
    it('elimina campos protegidos del body', () => {
      const req = {
        body: {
          name: 'Legítimo',
          _id: 'hack-id',
          createdAt: 'hack-date',
          updatedAt: 'hack-date',
        },
      };
      const res = {};
      const next = jest.fn();
      secureMid.cleanBody(req, res, next);
      expect(req.body.name).toBe('Legítimo');
      expect(req.body._id).toBeUndefined();
      expect(req.body.createdAt).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('notBlocked', () => {
    it('llama a next() cuando req.user.blocked es false', (done) => {
      const req = { user: { id: 'abc123', blocked: false } };
      const res = {};
      const next = (err) => {
        expect(err).toBeUndefined();
        done();
      };
      secureMid.notBlocked(req, res, next);
    });

    it('devuelve 403 cuando req.user.blocked es true', (done) => {
      const req = { user: { id: 'abc123', blocked: true } };
      const res = {};
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(403);
        done();
      };
      secureMid.notBlocked(req, res, next);
    });

    it('llama a next() sin error cuando req.user es undefined (edge case)', (done) => {
      const req = {};
      const res = {};
      const next = (err) => {
        expect(err).toBeUndefined();
        done();
      };
      secureMid.notBlocked(req, res, next);
    });
  });

  describe('isAuthorized', () => {
    it('permite pasar a un admin (tiene acceso a cualquier recurso)', () => {
      const req = {
        user: { id: 'admin123', role: 'admin' },
        params: { userId: 'otro-usuario-cualquiera' },
      };
      const res = {};
      const next = jest.fn();

      secureMid.isAuthorized(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user.id).toBe('admin123'); // no fue mutado
    });

    it('permite pasar a un usuario cuando el userId coincide con su propio ID', () => {
      const req = {
        user: { id: 'abc123', role: 'guest' },
        params: { userId: 'abc123' },
      };
      const res = {};
      const next = jest.fn();

      secureMid.isAuthorized(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user.id).toBe('abc123'); // no fue mutado
    });

    it('RECHAZA a un usuario guest cuando intenta acceder al recurso de OTRO usuario', () => {
      const req = {
        user: { id: 'abc123', role: 'guest' },
        params: { userId: 'xyz789' }, // ID de otro usuario
      };
      const res = {};
      const next = jest.fn();

      secureMid.isAuthorized(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.status).toBe(401);
      expect(req.user.id).toBe('abc123'); // no fue mutado — clave
    });

    it('NO muta req.user.id cuando rechaza el acceso (regresión del bug =)', () => {
      const req = {
        user: { id: 'mi-id-real', role: 'guest' },
        params: { userId: 'id-de-otro' },
      };
      const res = {};
      const next = jest.fn();

      secureMid.isAuthorized(req, res, next);

      // Si el bug (= en vez de ===) estuviera activo, req.user.id sería 'id-de-otro'
      expect(req.user.id).toBe('mi-id-real');
      expect(next.mock.calls[0][0].status).toBe(401);
    });
  });
});
