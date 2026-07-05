const mongoose = require('mongoose');
const User = require('../../models/user.model');
const dbHandler = require('../db-handler');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('User Model', () => {
  const validUserData = {
    name: 'María',
    surname: 'García',
    phone: 612345678,
    email: 'maria@test.com',
    password: 'test1234',
  };

  describe('Validaciones de campos obligatorios', () => {
    it('crea un usuario válido correctamente', async () => {
      const user = await User.create(validUserData);
      expect(user.name).toBe('María');
      expect(user.surname).toBe('García');
      expect(user.role).toBe('guest');
    });

    it('falla sin nombre', async () => {
      const data = { ...validUserData, name: undefined };
      await expect(User.create(data)).rejects.toThrow();
    });

    it('falla sin apellido', async () => {
      const data = { ...validUserData, surname: undefined };
      await expect(User.create(data)).rejects.toThrow();
    });

    it('falla sin email', async () => {
      const data = { ...validUserData, email: undefined };
      await expect(User.create(data)).rejects.toThrow();
    });

    it('falla sin contraseña', async () => {
      const data = { ...validUserData, password: undefined };
      await expect(User.create(data)).rejects.toThrow();
    });

    it('falla sin teléfono', async () => {
      const data = { ...validUserData, phone: undefined };
      await expect(User.create(data)).rejects.toThrow();
    });
  });

  describe('Validaciones de formato', () => {
    it('rechaza un email con formato inválido', async () => {
      const data = { ...validUserData, email: 'no-es-un-email' };
      await expect(User.create(data)).rejects.toThrow();
    });

    it('rechaza un nombre con más de 20 caracteres', async () => {
      const data = { ...validUserData, name: 'A'.repeat(21) };
      await expect(User.create(data)).rejects.toThrow();
    });

    it('rechaza un nombre con menos de 2 caracteres', async () => {
      const data = { ...validUserData, name: 'A' };
      await expect(User.create(data)).rejects.toThrow();
    });

    it('rechaza emails duplicados', async () => {
      await User.create(validUserData);
      await expect(User.create(validUserData)).rejects.toThrow();
    });
  });

  describe('Hashing de contraseña', () => {
    it('encripta la contraseña al guardar', async () => {
      const user = await User.create(validUserData);
      const rawUser = await User.findById(user.id).select('+password');
      expect(rawUser.password).not.toBe('test1234');
    });

    it('checkPassword devuelve true con la contraseña correcta', async () => {
      const user = await User.create(validUserData);
      const dbUser = await User.findById(user.id);
      const match = await dbUser.checkPassword('test1234');
      expect(match).toBe(true);
    });

    it('checkPassword devuelve false con contraseña incorrecta', async () => {
      const user = await User.create(validUserData);
      const dbUser = await User.findById(user.id);
      const match = await dbUser.checkPassword('wrongpassword');
      expect(match).toBe(false);
    });
  });

  describe('Serialización JSON (toJSON)', () => {
    it('elimina el campo password del JSON', async () => {
      const user = await User.create(validUserData);
      const json = user.toJSON();
      expect(json.password).toBeUndefined();
    });

    it('elimina __v del JSON', async () => {
      const user = await User.create(validUserData);
      const json = user.toJSON();
      expect(json.__v).toBeUndefined();
    });

    it('transforma _id a id', async () => {
      const user = await User.create(validUserData);
      const json = user.toJSON();
      expect(json.id).toBeDefined();
      expect(json._id).toBeUndefined();
    });
  });

  describe('Roles', () => {
    it('asigna el rol guest por defecto', async () => {
      const user = await User.create(validUserData);
      expect(user.role).toBe('guest');
    });

    it('rechaza un rol no válido', async () => {
      const data = { ...validUserData, role: 'superadmin' };
      await expect(User.create(data)).rejects.toThrow();
    });
  });

  describe('Blocked field', () => {
    it('asigna blocked=false por defecto si no se provee', async () => {
      const user = await User.create(validUserData);
      expect(user.blocked).toBe(false);
    });

    it('permite crear un usuario con blocked=true', async () => {
      const data = { ...validUserData, blocked: true };
      const user = await User.create(data);
      expect(user.blocked).toBe(true);
    });
  });
});
