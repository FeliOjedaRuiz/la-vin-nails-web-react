const createError = require('http-errors');
const registrationMid = require('../middlewares/registration.mid');
const AppSetting = require('../models/app-setting.model');
const dbHandler = require('./db-handler');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Registration Middleware', () => {
  describe('isOpen', () => {
    it('calls next() when registration.enabled is true', (done) => {
      const req = {};
      const res = {};
      const next = (err) => {
        expect(err).toBeUndefined();
        done();
      };
      // Create setting with value true
      AppSetting.create({ key: 'registration.enabled', value: true })
        .then(() => registrationMid.isOpen(req, res, next));
    });

    it('returns 403 when registration.enabled is false', (done) => {
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
      // Create setting with value false
      AppSetting.create({ key: 'registration.enabled', value: false })
        .then(() => registrationMid.isOpen(req, res, next));
    });

    it('calls next() when no registration.enabled doc exists (fail-open)', (done) => {
      const req = {};
      const res = {};
      const next = (err) => {
        expect(err).toBeUndefined();
        done();
      };
      // No doc created - fail open
      registrationMid.isOpen(req, res, next);
    });

    it('calls next() when doc is missing (explicit fail-open)', (done) => {
      const req = {};
      const res = {};
      const next = (err) => {
        expect(err).toBeUndefined();
        done();
      };
      // Ensure no doc exists
      AppSetting.deleteMany({ key: 'registration.enabled' })
        .then(() => registrationMid.isOpen(req, res, next));
    });

    it('passes through when DB findOne errors (fail-open via catch)', (done) => {
      const req = {};
      const res = {};
      // Mock AppSetting.findOne to reject
      const originalFindOne = AppSetting.findOne;
      AppSetting.findOne = jest.fn().mockReturnValue({
        then: () => Promise.reject(new Error('DB connection lost')),
      });
      const next = (err) => {
        expect(err).toBeDefined();
        AppSetting.findOne = originalFindOne; // restore
        done();
      };
      registrationMid.isOpen(req, res, next);
    });
  });
});