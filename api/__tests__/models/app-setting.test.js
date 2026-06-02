const mongoose = require('mongoose');
const AppSetting = require('../../models/app-setting.model');
const dbHandler = require('../db-handler');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('AppSetting Model', () => {
  describe('getOrDefault', () => {
    it('creates a new setting with the default value if key does not exist', async () => {
      const setting = await AppSetting.getOrDefault('registration.enabled', true);
      expect(setting.key).toBe('registration.enabled');
      expect(setting.value).toBe(true);
    });

    it('returns the existing value if key already exists', async () => {
      await AppSetting.create({ key: 'registration.enabled', value: false });
      const setting = await AppSetting.getOrDefault('registration.enabled', true);
      expect(setting.value).toBe(false);
    });

    it('does not overwrite existing value when using upsert', async () => {
      await AppSetting.create({ key: 'custom.setting', value: 'original' });
      const setting = await AppSetting.getOrDefault('custom.setting', 'default');
      expect(setting.value).toBe('original');
    });

    it('can store non-boolean values', async () => {
      const setting = await AppSetting.getOrDefault('app.name', 'La Vin Nails');
      expect(setting.value).toBe('La Vin Nails');
    });

    it('can store objects as Mixed type', async () => {
      const complexValue = { theme: 'dark', notifications: true };
      const setting = await AppSetting.getOrDefault('complex.setting', complexValue);
      expect(setting.value).toEqual(complexValue);
    });

    it('returns the document with id field for toJSON transform', async () => {
      const setting = await AppSetting.getOrDefault('test.key', 'value');
      const json = setting.toJSON();
      expect(json.id).toBeDefined();
      expect(json._id).toBeUndefined();
      expect(json.__v).toBeUndefined();
    });
  });

  describe('unique key constraint', () => {
    it('rejects duplicate keys with a validation error', async () => {
      await AppSetting.create({ key: 'duplicate.key', value: 'first' });
      await expect(
        AppSetting.create({ key: 'duplicate.key', value: 'second' })
      ).rejects.toThrow();
    });

    it('enforces index on key field', async () => {
      const indexes = AppSetting.schema.indexes();
      // Find index on 'key' field - it could be [{ key: 1 }] with unique in options
      const keyIndex = indexes.find((idx) => idx[0].key !== undefined);
      expect(keyIndex).toBeDefined();
      // unique is in the second element of the index definition
      expect(keyIndex[1].unique).toBe(true);
    });
  });

  describe('timestamps', () => {
    it('has createdAt and updatedAt timestamps', async () => {
      const setting = await AppSetting.getOrDefault('timestamp.test', true);
      expect(setting.createdAt).toBeDefined();
      expect(setting.updatedAt).toBeDefined();
    });
  });
});