const Turn = require('../../models/turn.model');
const User = require('../../models/user.model');
const turnsController = require('../../controllers/turns.controllers');
const dbHandler = require('../db-handler');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Turns Controller', () => {
  const setupTurns = async () => {
    // Generar fechas: hoy, mañana, y una fecha de hace 2 semanas
    const now = new Date();

    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);
    const pastStr = twoWeeksAgo.toISOString().split('T')[0];

    await Turn.create([
      { date: pastStr, hour: '10:00' },
      { date: today, hour: '11:00' },
      { date: tomorrowStr, hour: '12:00' }
    ]);

    return { pastStr, today, tomorrowStr };
  };

  const setupCategorizedTurns = async () => {
    // Usar una fecha futura dentro del mes visible para evitar el techo de visibilidad
    const startDate = '2026-08-03';
    const turnDate = '2026-08-04';

    await Turn.create([
      { date: turnDate, hour: '10:00', category: 'normal' },
      { date: turnDate, hour: '11:00', category: 'normal' },
      { date: turnDate, hour: '12:00', category: 'retiro' },
      { date: turnDate, hour: '13:00', category: 'retiro' },
    ]);

    return { startDate };
  };

  describe('list', () => {
    it('un guest (sin req.user) no puede ver turnos de semanas pasadas', (done) => {
      setupTurns().then(({ pastStr, today }) => {
        // Pedimos desde la fecha del pasado
        const req = { params: { date: pastStr }, query: {}, user: undefined };
        const res = {
          json(turns) {
            // No debería haber turnos de hace 2 semanas
            const hasPastTurn = turns.some(t => t.date === pastStr);
            expect(hasPastTurn).toBe(false);
            // Debería ver el de mañana por ejemplo (siempre que startDate < date)
            // Nota: el criterio es { date: { $gt: startDate } }
            done();
          }
        };
        const next = (err) => done(err);
        turnsController.list(req, res, next);
      });
    });

    it('un administrador puede ver todos los turnos sin restricción de fecha', async () => {
      const { pastStr } = await setupTurns();
      const adminUser = { role: 'admin' };
      
      return new Promise((resolve, reject) => {
        const req = { params: { date: '2000-01-01' }, query: {}, user: adminUser };
        const res = {
          json(turns) {
            try {
              const hasPastTurn = turns.some(t => t.date === pastStr);
              expect(hasPastTurn).toBe(true);
              resolve();
            } catch (e) {
              reject(e);
            }
          }
        };
        const next = (err) => reject(err);
        turnsController.list(req, res, next);
      });
    });

    it('respeta el parámetro endDate si se proporciona', async () => {
      const { today, tomorrowStr } = await setupTurns();

      return new Promise((resolve) => {
        // Pedimos solo hasta hoy
        const req = {
          params: { date: '2000-01-01' },
          query: { endDate: today },
          user: { role: 'admin' }
        };
        const res = {
          json(turns) {
            const hasTomorrow = turns.some(t => t.date === tomorrowStr);
            expect(hasTomorrow).toBe(false);
            resolve();
          }
        };
        const next = () => {};
        turnsController.list(req, res, next);
      });
    });

    it('guest ?category=retiro returns only retiro turns', async () => {
      const { startDate } = await setupCategorizedTurns();

      return new Promise((resolve, reject) => {
        const req = { params: { date: startDate }, query: { category: 'retiro' }, user: undefined };
        const res = {
          json(turns) {
            try {
              expect(turns).toHaveLength(2);
              expect(turns.every(t => t.category === 'retiro')).toBe(true);
              resolve();
            } catch (e) {
              reject(e);
            }
          }
        };
        const next = (err) => reject(err);
        turnsController.list(req, res, next);
      });
    });

    it('guest ?category=normal returns only normal turns', async () => {
      const { startDate } = await setupCategorizedTurns();

      return new Promise((resolve, reject) => {
        const req = { params: { date: startDate }, query: { category: 'normal' }, user: undefined };
        const res = {
          json(turns) {
            try {
              expect(turns).toHaveLength(2);
              expect(turns.every(t => t.category === 'normal')).toBe(true);
              resolve();
            } catch (e) {
              reject(e);
            }
          }
        };
        const next = (err) => reject(err);
        turnsController.list(req, res, next);
      });
    });

    it('admin without category sees both normal and retiro turns', async () => {
      const { startDate } = await setupCategorizedTurns();

      return new Promise((resolve, reject) => {
        const req = { params: { date: startDate }, query: {}, user: { role: 'admin' } };
        const res = {
          json(turns) {
            try {
              expect(turns).toHaveLength(4);
              const categories = turns.map(t => t.category).sort();
              expect(categories).toEqual(['normal', 'normal', 'retiro', 'retiro']);
              resolve();
            } catch (e) {
              reject(e);
            }
          }
        };
        const next = (err) => reject(err);
        turnsController.list(req, res, next);
      });
    });

    it('admin with ?category=retiro still sees both categories (param ignored)', async () => {
      const { startDate } = await setupCategorizedTurns();

      return new Promise((resolve, reject) => {
        const req = { params: { date: startDate }, query: { category: 'retiro' }, user: { role: 'admin' } };
        const res = {
          json(turns) {
            try {
              expect(turns).toHaveLength(4);
              const categories = turns.map(t => t.category).sort();
              expect(categories).toEqual(['normal', 'normal', 'retiro', 'retiro']);
              resolve();
            } catch (e) {
              reject(e);
            }
          }
        };
        const next = (err) => reject(err);
        turnsController.list(req, res, next);
      });
    });

    it('ignores an invalid category query param and returns all turns', async () => {
      const { startDate } = await setupCategorizedTurns();

      return new Promise((resolve, reject) => {
        const req = { params: { date: startDate }, query: { category: 'express' }, user: undefined };
        const res = {
          json(turns) {
            try {
              expect(turns).toHaveLength(4);
              resolve();
            } catch (e) {
              reject(e);
            }
          }
        };
        const next = (err) => reject(err);
        turnsController.list(req, res, next);
      });
    });
  });
});
