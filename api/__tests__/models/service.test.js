const Service = require('../../models/service.model');
const dbHandler = require('../db-handler');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Service Model', () => {
  const validServiceData = {
    name: 'Semipermanente + refuerzo',
    type: ['Manos'],
    description: 'Manicura semipermanente con tratamiento de refuerzo.',
    price: 15,
    dateDuration: '1:15 hs. aprox.',
  };

  describe('Validaciones de campos obligatorios', () => {
    it('crea un servicio válido correctamente', async () => {
      const service = await Service.create(validServiceData);
      expect(service.name).toBe('Semipermanente + refuerzo');
      expect(service.price).toBe(15);
    });

    it('falla sin nombre', async () => {
      const data = { ...validServiceData, name: undefined };
      await expect(Service.create(data)).rejects.toThrow();
    });

    it('falla sin tipo', async () => {
      const { type, ...data } = validServiceData;
      data.type = null;
      await expect(Service.create(data)).rejects.toThrow();
    });

    it('falla sin descripción', async () => {
      const data = { ...validServiceData, description: undefined };
      await expect(Service.create(data)).rejects.toThrow();
    });

    it('permite servicio sin precio (opcional)', async () => {
      const data = { ...validServiceData, price: undefined };
      const service = await Service.create(data);
      expect(service.price).toBeUndefined();
    });
  });

  describe('Serialización JSON (toJSON)', () => {
    it('transforma _id a id y elimina __v', async () => {
      const service = await Service.create(validServiceData);
      const json = service.toJSON();
      expect(json.id).toBeDefined();
      expect(json._id).toBeUndefined();
      expect(json.__v).toBeUndefined();
    });
  });
});
