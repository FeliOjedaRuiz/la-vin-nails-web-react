const User = require('../../models/user.model');
const jwt = require('jsonwebtoken');
const dbHandler = require('../db-handler');

// Definir JWT_SECRET para tests
process.env.JWT_SECRET = 'test-secret-key';
process.env.MAX_SESSION_TIME = '3600';

const usersController = require('../../controllers/users.controllers');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Users Controller', () => {
  const validUserData = {
    name: 'María',
    surname: 'García',
    phone: 612345678,
    email: 'maria@test.com',
    password: 'test1234',
  };

  describe('create (registro)', () => {
    it('crea un usuario y devuelve 201', (done) => {
      const req = { body: validUserData };
      const res = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(data) {
          // Express internamente serializa con JSON.stringify, que invoca toJSON()
          const serialized = JSON.parse(JSON.stringify(data));
          expect(this.statusCode).toBe(201);
          expect(serialized.name).toBe('María');
          expect(serialized.password).toBeUndefined();
          done();
        },
      };
      const next = (err) => done(err);
      usersController.create(req, res, next);
    });

    it('llama a next con error si faltan campos', (done) => {
      const req = { body: { name: 'Solo nombre' } };
      const res = {
        status() { return this; },
        json() { done(new Error('No debería llegar aquí')); },
      };
      const next = (err) => {
        expect(err).toBeDefined();
        done();
      };
      usersController.create(req, res, next);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await User.create(validUserData);
    });

    it('devuelve un token JWT con credenciales correctas', (done) => {
      const req = {
        body: { email: 'maria@test.com', password: 'test1234' },
      };
      const res = {
        json(data) {
          expect(data).toBeDefined();
          expect(data.token).toBeDefined();
          expect(data.name).toBe('María');
          done();
        },
      };
      const next = (err) => done(err);
      usersController.login(req, res, next);
    });

    it('llama a next con 401 si el email no existe', (done) => {
      const req = {
        body: { email: 'noexiste@test.com', password: 'test1234' },
      };
      const res = { json: jest.fn() };
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(401);
        done();
      };
      usersController.login(req, res, next);
    });

    it('llama a next con 401 si la contraseña es incorrecta', (done) => {
      const req = {
        body: { email: 'maria@test.com', password: 'wrongpassword' },
      };
      const res = { json: jest.fn() };
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(401);
        done();
      };
      usersController.login(req, res, next);
    });
  });

  describe('list', () => {
    it('devuelve un array de usuarios', (done) => {
      User.create(validUserData).then(() => {
        const req = { body: {}, params: {}, query: {} };
        const res = {
          json(data) {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBe(1);
            done();
          },
        };
        const next = (err) => done(err);
        usersController.list(req, res, next);
      });
    });
  });
});
