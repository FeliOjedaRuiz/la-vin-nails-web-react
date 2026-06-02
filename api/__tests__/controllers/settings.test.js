const AppSetting = require('../../models/app-setting.model');
const settingsController = require('../../controllers/settings.controllers');
const User = require('../../models/user.model');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const dbHandler = require('../db-handler');

process.env.JWT_SECRET = 'test-secret-key';

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Settings Controller', () => {
  let adminUser;
  let adminToken;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Admin',
      surname: 'User',
      phone: 600000001,
      email: 'admin@test.com',
      password: 'admin1234',
      role: 'admin',
    });
    adminToken = jwt.sign(
      { sub: adminUser.id, exp: Math.floor(Date.now() / 1000) + 3600 },
      process.env.JWT_SECRET
    );
  });

  describe('list', () => {
    it('returns all settings as key-value map', (done) => {
      AppSetting.create({ key: 'test.key', value: 'test-value' }).then(() => {
        const req = {};
        const res = {
          json(data) {
            expect(data['test.key']).toBe('test-value');
            done();
          },
        };
        const next = (err) => done(err);
        settingsController.list(req, res, next);
      });
    });

    it('seeds registration.enabled on first call if missing', (done) => {
      const req = {};
      const res = {
        json(data) {
          expect(data['registration.enabled']).toBe(true);
          done();
        },
      };
      const next = (err) => done(err);
      settingsController.list(req, res, next);
    });

    it('does not re-seed if registration.enabled already exists', (done) => {
      AppSetting.create({ key: 'registration.enabled', value: false }).then(() => {
        const req = {};
        const res = {
          json(data) {
            expect(data['registration.enabled']).toBe(false);
            done();
          },
        };
        const next = (err) => done(err);
        settingsController.list(req, res, next);
      });
    });
  });

  describe('getByKey', () => {
    it('returns the setting document when key exists', (done) => {
      AppSetting.create({ key: 'test.key', value: 'test-value' }).then(() => {
        const req = { params: { key: 'test.key' } };
        const res = {
          json(data) {
            expect(data.key).toBe('test.key');
            expect(data.value).toBe('test-value');
            done();
          },
        };
        const next = (err) => done(err);
        settingsController.getByKey(req, res, next);
      });
    });

    it('seeds and returns registration.enabled if missing', (done) => {
      const req = { params: { key: 'registration.enabled' } };
      const res = {
        json(data) {
          expect(data.key).toBe('registration.enabled');
          expect(data.value).toBe(true);
          done();
        },
      };
      const next = (err) => done(err);
      settingsController.getByKey(req, res, next);
    });

    it('returns 404 for non-existent non-registration keys', (done) => {
      const req = { params: { key: 'nonexistent.key' } };
      const res = {};
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(404);
        done();
      };
      settingsController.getByKey(req, res, next);
    });
  });

  describe('update', () => {
    it('updates an existing setting', (done) => {
      AppSetting.create({ key: 'test.key', value: 'old' }).then(() => {
        const req = { params: { key: 'test.key' }, body: { value: 'new' } };
        const res = {
          json(data) {
            expect(data.value).toBe('new');
            done();
          },
        };
        const next = (err) => done(err);
        settingsController.update(req, res, next);
      });
    });

    it('creates (upsert) a setting if it does not exist', (done) => {
      const req = { params: { key: 'new.key' }, body: { value: 'new-value' } };
      const res = {
        json(data) {
          expect(data.key).toBe('new.key');
          expect(data.value).toBe('new-value');
          done();
        },
      };
      const next = (err) => done(err);
      settingsController.update(req, res, next);
    });

    it('returns 400 if value is missing from body', (done) => {
      const req = { params: { key: 'test.key' }, body: {} };
      const res = {};
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(400);
        done();
      };
      settingsController.update(req, res, next);
    });

    it('returns 400 if registration.enabled value is not boolean', (done) => {
      const req = { params: { key: 'registration.enabled' }, body: { value: 'yes' } };
      const res = {};
      const next = (err) => {
        expect(err).toBeDefined();
        expect(err.status).toBe(400);
        done();
      };
      settingsController.update(req, res, next);
    });

    it('allows boolean false for registration.enabled', (done) => {
      const req = { params: { key: 'registration.enabled' }, body: { value: false } };
      const res = {
        json(data) {
          expect(data.value).toBe(false);
          done();
        },
      };
      const next = (err) => done(err);
      settingsController.update(req, res, next);
    });
  });
});