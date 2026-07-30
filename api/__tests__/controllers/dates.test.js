const Date = require('../../models/date.model');
const Turn = require('../../models/turn.model');
const Service = require('../../models/service.model');
const User = require('../../models/user.model');
const datesController = require('../../controllers/dates.controllers');
const dbHandler = require('../db-handler');

jest.mock('../../config/mailer.config', () => ({ sendDateCreationEmail: jest.fn() }));
jest.mock('../../utils/push.service', () => ({ notifyAdmins: jest.fn() }));

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Dates Controller — service↔turn category guard', () => {
  const setupRetiroService = () =>
    Service.create({
      name: 'Retiro',
      type: ['uñas de gel'],
      description: 'Remoción del material.',
      price: 5,
      dateDuration: '0:30',
    });

  const setupNormalService = () =>
    Service.create({
      name: 'Semipermanente',
      type: ['sin limado'],
      description: 'Esmaltado semipermanente.',
      price: 10,
      dateDuration: '1',
    });

  const setupUser = () =>
    User.create({
      name: 'Test',
      surname: 'User',
      phone: 123456789,
      email: 'test@example.com',
      password: 'pass1234',
    });

  const setupTurn = (category) =>
    Turn.create({ date: '2026-08-04', hour: '10:00', category });

  const runCreate = async (turnId, serviceId, userId) => {
    const req = {
      body: {
        service: serviceId,
        turn: turnId,
        type: 'uñas de gel',
        user: userId,
      },
    };

    return new Promise((resolve) => {
      const res = {
        statusCode: null,
        body: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          resolve({ status: this.statusCode, body: this.body, error: null });
        },
      };
      const next = (error) => resolve({ status: error.status, error, body: null });
      datesController.create(req, res, next);
    });
  };

  const runUpdate = async (existingDate, body) => {
    const req = {
      date: existingDate,
      body,
    };

    return new Promise((resolve) => {
      const res = {
        statusCode: null,
        body: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          resolve({ status: this.statusCode, body: this.body, error: null });
        },
      };
      const next = (error) => resolve({ status: error.status, error, body: null });
      datesController.update(req, res, next);
    });
  };

  it('POST returns 400 when Retiro service is paired with a normal turn', async () => {
    const [service, turn, user] = await Promise.all([
      setupRetiroService(),
      setupTurn('normal'),
      setupUser(),
    ]);

    const result = await runCreate(turn.id, service.id, user.id);

    expect(result.error.status).toBe(400);
    expect(result.error.message).toBe(
      'El servicio Retiro solo puede reservarse en turnos marcados como retiro.'
    );

    const persistedDates = await Date.find();
    expect(persistedDates).toHaveLength(0);
  });

  it('POST returns 400 when a non-Retiro service is paired with a retiro turn', async () => {
    const [service, turn, user] = await Promise.all([
      setupNormalService(),
      setupTurn('retiro'),
      setupUser(),
    ]);

    const result = await runCreate(turn.id, service.id, user.id);

    expect(result.error.status).toBe(400);
    expect(result.error.message).toBe(
      'Los turnos marcados como retiro solo admiten el servicio Retiro.'
    );

    const persistedDates = await Date.find();
    expect(persistedDates).toHaveLength(0);
  });

  it('POST creates the date when Retiro service is paired with a retiro turn', async () => {
    const [service, turn, user] = await Promise.all([
      setupRetiroService(),
      setupTurn('retiro'),
      setupUser(),
    ]);

    const result = await runCreate(turn.id, service.id, user.id);

    expect(result.status).toBe(201);
    expect(result.body).toBeDefined();
    expect(result.body.service.toString()).toBe(service.id);
    expect(result.body.turn.toString()).toBe(turn.id);

    const persistedDates = await Date.find();
    expect(persistedDates).toHaveLength(1);
  });

  it('PATCH returns 400 before persisting when update would create a mismatch', async () => {
    const [retiroService, normalService, normalTurn, retiroTurn, user] = await Promise.all([
      setupRetiroService(),
      setupNormalService(),
      setupTurn('normal'),
      setupTurn('retiro'),
      setupUser(),
    ]);

    const existingDate = await Date.create({
      service: normalService.id,
      turn: normalTurn.id,
      type: 'uñas de gel',
      user: user.id,
    });

    // Intentar reemplazar el servicio por Retiro sin cambiar el turno a retiro
    const result = await runUpdate(existingDate, {
      service: retiroService.id,
      turn: normalTurn.id,
      type: 'uñas de gel',
      user: user.id,
    });

    expect(result.error.status).toBe(400);
    expect(result.error.message).toBe(
      'El servicio Retiro solo puede reservarse en turnos marcados como retiro.'
    );

    const unchangedDate = await Date.findById(existingDate.id);
    expect(unchangedDate.service.toString()).toBe(normalService.id);
    expect(unchangedDate.turn.toString()).toBe(normalTurn.id);
  });

  it('leaves the turn locked when a mismatch rejects the date (client rollback responsibility)', async () => {
    const [service, turn, user] = await Promise.all([
      setupRetiroService(),
      setupTurn('normal'),
      setupUser(),
    ]);

    // Simular el lock previo del cliente: turno marcado como Solicitado
    turn.state = 'Solicitado';
    await turn.save();

    const result = await runCreate(turn.id, service.id, user.id);

    expect(result.error.status).toBe(400);

    const lockedTurn = await Turn.findById(turn.id);
    expect(lockedTurn.state).toBe('Solicitado');

    const persistedDates = await Date.find();
    expect(persistedDates).toHaveLength(0);
  });
});
