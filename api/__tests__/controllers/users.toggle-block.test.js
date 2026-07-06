const User = require('../../models/user.model');
const jwt = require('jsonwebtoken');
const dbHandler = require('../db-handler');

process.env.JWT_SECRET = 'test-secret-key';
process.env.MAX_SESSION_TIME = '3600';

const usersController = require('../../controllers/users.controllers');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('toggleBlock', () => {
  it('devuelve 200 y bloquea al usuario (blocked=true)', (done) => {
    User.create({
      name: 'Admin',
      surname: 'User',
      phone: 612345679,
      email: 'admin@test.com',
      password: 'adm1',
      role: 'admin',
    }).then((admin) => {
      User.create({
        name: 'María',
        surname: 'García',
        phone: 612345678,
        email: 'maria@test.com',
        password: 'pass',
      }).then((target) => {
        const req = { user: admin, clientUser: target, params: { userId: target.id } };
        const res = {
          json(data) {
            expect(data.blocked).toBe(true);
            done();
          },
        };
        const next = (err) => done(err);
        usersController.toggleBlock(req, res, next);
      });
    });
  });

  it('devuelve 200 y desbloquea al usuario (blocked=false)', (done) => {
    User.create({
      name: 'Admin',
      surname: 'User',
      phone: 612345679,
      email: 'admin@test.com',
      password: 'adm1',
      role: 'admin',
    }).then((admin) => {
      User.create({
        name: 'María',
        surname: 'García',
        phone: 612345678,
        email: 'maria@test.com',
        password: 'pass',
        blocked: true,
      }).then((target) => {
        const req = { user: admin, clientUser: target, params: { userId: target.id } };
        const res = {
          json(data) {
            expect(data.blocked).toBe(false);
            done();
          },
        };
        const next = (err) => done(err);
        usersController.toggleBlock(req, res, next);
      });
    });
  });

  it('devuelve 400 cuando admin intenta bloquearse a sí mismo', (done) => {
    User.create({
      name: 'Admin',
      surname: 'User',
      phone: 612345679,
      email: 'admin@test.com',
      password: 'adm1',
      role: 'admin',
    }).then((admin) => {
      const req = { user: admin, clientUser: admin, params: { userId: admin.id } };
      const res = { json: jest.fn() };
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(400);
        expect(err.message).toBe('No podés bloquear tu propia cuenta');
        done();
      };
      usersController.toggleBlock(req, res, next);
    });
  });
});

describe('login — blocked user scenarios', () => {
  beforeEach((done) => {
    User.create({
      name: 'María',
      surname: 'García',
      phone: 612345678,
      email: 'maria@test.com',
      password: 'pass',
    }).then(() => done());
  });

  it('devuelve error generico (sin leak) cuando password correcta y blocked=true', (done) => {
    User.findOneAndUpdate({ email: 'maria@test.com' }, { blocked: true }, { new: true }).then(() => {
      const req = { body: { email: 'maria@test.com', password: 'pass' } };
      const res = { json: jest.fn() };
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(401);
        expect(err.errors.password).toBe('Credenciales invalidas');
        done();
      };
      usersController.login(req, res, next);
    });
  });

  it('devuelve 401 sin leak cuando blocked=true y password incorrecta', (done) => {
    User.findOneAndUpdate({ email: 'maria@test.com' }, { blocked: true }, { new: true }).then(() => {
      const req = { body: { email: 'maria@test.com', password: 'wrong' } };
      const res = { json: jest.fn() };
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(401);
        expect(err.errors.password).toBe('Credenciales invalidas');
        done();
      };
      usersController.login(req, res, next);
    });
  });

  it('devuelve 200 + JWT cuando blocked=false y credenciales correctas', (done) => {
    const req = { body: { email: 'maria@test.com', password: 'pass' } };
    const res = {
      json(data) {
        expect(data.token).toBeDefined();
        expect(data.blocked).toBe(false);
        done();
      },
    };
    const next = (err) => done(err);
    usersController.login(req, res, next);
  });
});
