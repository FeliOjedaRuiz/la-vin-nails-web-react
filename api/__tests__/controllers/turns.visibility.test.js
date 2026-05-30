const Turn = require('../../models/turn.model');
const turnsController = require('../../controllers/turns.controllers');
const dbHandler = require('../db-handler');

// Aumentar el timeout para evitar fallos en CI/entornos lentos
jest.setTimeout(60000);

beforeAll(async () => await dbHandler.connect());
afterEach(async () => {
  await dbHandler.clearDatabase();
  jest.useRealTimers();
});
afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe('Turns Visibility — Backend Clamping', () => {
  const setupTurns = async () => {
    await Turn.create([
      { date: '2026-05-15', hour: '10:00' },
      { date: '2026-06-15', hour: '11:00' },
      { date: '2026-07-15', hour: '12:00' }
    ]);
  };

  it('un guest no puede ver turnos de julio si hoy es 1 de mayo', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-01T12:00:00Z'));

    await setupTurns();

    const req = { params: { date: '2000-01-01' }, query: {}, user: undefined };
    
    const turns = await new Promise((resolve, reject) => {
      const res = {
        json: (data) => resolve(data)
      };
      const next = (err) => reject(err);
      turnsController.list(req, res, next).catch(reject);
    });

    const hasJuly = turns.some(t => t.date.startsWith('2026-07'));
    const hasJune = turns.some(t => t.date.startsWith('2026-06'));
    const hasMay = turns.some(t => t.date.startsWith('2026-05'));

    expect(hasMay).toBe(true);
    expect(hasJune).toBe(true);
    expect(hasJuly).toBe(false);
  });

  it('un admin puede ver todos los turnos (incluyendo julio)', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-01T12:00:00Z'));

    await setupTurns();

    const req = { params: { date: '2000-01-01' }, query: {}, user: { role: 'admin' } };
    
    const turns = await new Promise((resolve, reject) => {
      const res = {
        json: (data) => resolve(data)
      };
      const next = (err) => reject(err);
      turnsController.list(req, res, next).catch(reject);
    });

    const hasJuly = turns.some(t => t.date.startsWith('2026-07'));
    expect(hasJuly).toBe(true);
  });

  it('respeta el timezone de España (31 mayo 23:59 UTC es 1 junio 01:59 ES → julio abierto)', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-31T23:59:00Z'));

    await setupTurns();

    const req = { params: { date: '2000-01-01' }, query: {}, user: undefined };
    
    const turns = await new Promise((resolve, reject) => {
      const res = {
        json: (data) => resolve(data)
      };
      const next = (err) => reject(err);
      turnsController.list(req, res, next).catch(reject);
    });

    const hasJuly = turns.some(t => t.date.startsWith('2026-07'));
    expect(hasJuly).toBe(true);
  });
});
