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

  describe('restorePassword', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        ...validUserData,
        role: 'guest', // rol normal, no admin
      });
    });

    it('actualiza la contraseña y devuelve el usuario', (done) => {
      const req = {
        user: testUser,
        body: { password: 'nuevaPass123' },
      };
      const res = {
        json(user) {
          expect(user).toBeDefined();
          expect(user.role).toBe('guest'); // el rol no cambió
          done();
        },
      };
      const next = (err) => done(err);
      usersController.restorePassword(req, res, next);
    });

    it('NO permite escalar privilegios enviando role en el body', (done) => {
      const req = {
        user: testUser,
        body: {
          password: 'passConHack',
          role: 'admin', // intento malicioso
        },
      };
      const res = {
        json(user) {
          // Si el bug existiera, user.role sería 'admin'
          expect(user.role).toBe('guest');
          done();
        },
      };
      const next = (err) => done(err);
      usersController.restorePassword(req, res, next);
    });

    it('solo actualiza el campo password, ignora campos extraños del body', (done) => {
      const req = {
        user: testUser,
        body: {
          password: 'password-limpia',
          role: 'admin',
          email: 'hacked@evil.com', // intento de cambiar email
          __v: 999,
        },
      };
      const res = {
        json(user) {
          expect(user.role).toBe('guest');
          expect(user.email).toBe('maria@test.com'); // email original
          done();
        },
      };
      const next = (err) => done(err);
      usersController.restorePassword(req, res, next);
    });
  });

  describe('Registration Gate', () => {
    const AppSetting = require('../../models/app-setting.model');
    const registrationMid = require('../../middlewares/registration.mid');

    it('blocks POST /users when registration.enabled is false', (done) => {
      AppSetting.create({ key: 'registration.enabled', value: false }).then(() => {
        const req = {};
        const res = {
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(data) {
            expect(this.statusCode).toBe(403);
            expect(data.message).toBe('Registro temporalmente cerrado.');
            done();
          },
        };
        const next = jest.fn();
        registrationMid.isOpen(req, res, next);
      });
    });

    it('allows POST /users when registration.enabled is true', (done) => {
      AppSetting.create({ key: 'registration.enabled', value: true }).then(() => {
        const req = {};
        const res = {};
        const next = (err) => {
          expect(err).toBeUndefined();
          done();
        };
        registrationMid.isOpen(req, res, next);
      });
    });

    it('allows POST /users when registration.enabled doc is missing (fail-open)', (done) => {
      AppSetting.deleteMany({ key: 'registration.enabled' }).then(() => {
        const req = {};
        const res = {};
        const next = (err) => {
          expect(err).toBeUndefined();
          done();
        };
        registrationMid.isOpen(req, res, next);
      });
    });
  });
});
