const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const dbHandler = require('../db-handler');

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
});
