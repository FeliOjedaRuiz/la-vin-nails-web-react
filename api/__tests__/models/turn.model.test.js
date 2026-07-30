const Turn = require('../../models/turn.model');
const dbHandler = require('../db-handler');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Turn model', () => {
  it('default category is normal when not provided', async () => {
    const turn = await Turn.create({ date: '2026-08-03', hour: '10:00' });
    expect(turn.category).toBe('normal');
  });

  it('rejects an invalid category value', async () => {
    await expect(
      Turn.create({ date: '2026-08-03', hour: '10:00', category: 'express' })
    ).rejects.toThrow();
  });

  it('persists a retiro category when provided', async () => {
    const turn = await Turn.create({ date: '2026-08-03', hour: '10:00', category: 'retiro' });
    expect(turn.category).toBe('retiro');
  });
});
