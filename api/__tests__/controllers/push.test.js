const PushSubscription = require('../../models/push-subscription.model');
const pushController = require('../../controllers/push.controllers');
const dbHandler = require('../db-handler');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Push Controller', () => {
    describe('getPublicKey', () => {
        it('should return 200 and the public key if VAPID_PUBLIC_KEY is set', () => {
            process.env.VAPID_PUBLIC_KEY = 'test-key';
            const req = {};
            const res = {
                json: jest.fn()
            };
            const next = jest.fn();

            pushController.getPublicKey(req, res, next);

            expect(res.json).toHaveBeenCalledWith({ publicKey: 'test-key' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with 500 if VAPID_PUBLIC_KEY is not set', () => {
            delete process.env.VAPID_PUBLIC_KEY;
            const req = {};
            const res = {
                json: jest.fn()
            };
            const next = jest.fn();

            pushController.getPublicKey(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.status).toBe(500);
        });
    });

    describe('subscribe', () => {
        const mockUser = { id: '64f8a8e1e4b0f6a1e4b0f6a2' };
        const validSubscription = {
            endpoint: 'https://fcm.googleapis.com/fcm/send/test',
            keys: {
                auth: 'auth-key',
                p256dh: 'p256dh-key'
            }
        };

        it('should return 201 and create a subscription', (done) => {
            const req = {
                user: mockUser,
                body: validSubscription
            };
            const res = {
                statusCode: 0,
                status(code) { this.statusCode = code; return this; },
                json(data) {
                    expect(this.statusCode).toBe(201);
                    expect(data.endpoint).toBe(validSubscription.endpoint);
                    expect(data.user.toString()).toBe(mockUser.id);
                    done();
                }
            };
            const next = (err) => done(err);

            pushController.subscribe(req, res, next);
        });

        it('should return 400 if subscription data is missing', (done) => {
            const req = {
                user: mockUser,
                body: { endpoint: 'only-endpoint' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = (err) => {
                expect(err).toBeDefined();
                expect(err.status).toBe(400);
                done();
            };

            pushController.subscribe(req, res, next);
        });

        it('should upscale to existing subscription if endpoint already exists (upsert)', async () => {
            // First creation
            await PushSubscription.create({ ...validSubscription, user: mockUser.id });
            
            return new Promise((resolve, reject) => {
                const req = {
                    user: mockUser,
                    body: validSubscription
                };
                const res = {
                    status: (code) => {
                        expect(code).toBe(201);
                        return {
                            json: (data) => {
                                expect(data.endpoint).toBe(validSubscription.endpoint);
                                // Ensure we didn't crash
                                resolve();
                            }
                        };
                    }
                };
                const next = (err) => reject(err);
                
                pushController.subscribe(req, res, next);
            });
        });
    });
});
