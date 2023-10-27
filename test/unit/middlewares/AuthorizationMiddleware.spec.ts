import { Request, Response, NextFunction } from 'express';
import HttpRequestErrors from 'src/services/helpers/HttpRequestErrors';
import AuthorizationMiddleware from 'src/middlewares/AuthorizationMiddleware';
import speakeasy from 'speakeasy';
import { User } from 'src/schemas/user/usersValidationSchema';
import GeneralDataFaker, { UserDetailFaker, UserFaker } from '../../support/datafakers/GeneralDataFaker';
import Database from '../../support/Database';
import logger from '@tablerise/dynamic-logger';
import { UserDetail } from 'src/schemas/user/userDetailsValidationSchema';

jest.mock('qrcode', () => ({
    toDataURL: () => '',
}));

describe('Middlewares :: AuthorizationMiddleware', () => {
    let user: User,
        userDetails: UserDetail,
        updatedInProgressToDone: User,
        authorizationMiddleware: AuthorizationMiddleware;

    const { User, UserDetails } = Database.models;

    const request = {} as Request;
    const response = {} as Response;
    let next: NextFunction;

    beforeAll(() => {
        authorizationMiddleware = new AuthorizationMiddleware(User, UserDetails, logger);
    });

    describe('Method checkAdminRole - Request is made for verify the role', () => {
        beforeAll(() => {
            userDetails = GeneralDataFaker.generateUserDetailJSON({} as UserDetailFaker).map((detail) => {
                delete detail._id;
                delete detail.userId;

                return detail;
            })[0];

            request.user = {
                userId: '123456789123456789123456',
                providerId: null,
                username: 'test',
                iat: 1234,
                exp: 1234,
            };

            next = jest.fn();
        });

        afterAll(() => {
            jest.clearAllMocks();
        });

        describe('and the userDetails is correct', () => {
            beforeAll(() => {
                userDetails.role = 'admin';
                jest.spyOn(UserDetails, 'findAll').mockResolvedValue([userDetails]);
            });

            it('should be return successful if role is admin', async () => {
                await authorizationMiddleware.checkAdminRole(request, response, next);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('and the userDetails are incorrect', () => {
            it('should return error if userDetails is not found', async () => {
                jest.spyOn(UserDetails, 'findAll').mockResolvedValue([]);

                try {
                    await authorizationMiddleware.checkAdminRole(request, response, next);
                    expect('it should not be here').toBe(true);
                } catch (error) {
                    const err = error as HttpRequestErrors;

                    expect(err.message).toStrictEqual('User does not exist');
                    expect(err.name).toBe('NotFound');
                    expect(err.code).toBe(404);
                }
            });

            it('should be return error if role is not admin', async () => {
                userDetails.role = 'user';
                jest.spyOn(UserDetails, 'findAll').mockResolvedValue([userDetails]);

                try {
                    await authorizationMiddleware.checkAdminRole(request, response, next);
                    expect('it should not be here').toBe(true);
                } catch (error) {
                    const err = error as HttpRequestErrors;

                    expect(err.message).toStrictEqual('Unauthorized');
                    expect(err.name).toBe('Unauthorized');
                    expect(err.code).toBe(401);
                }
            });
        });
    });

    describe('Method twoFactor - Request is made for verify the two factor', () => {
        beforeAll(() => {
            user = GeneralDataFaker.generateUserJSON({} as UserFaker).map((user) => {
                delete user._id;
                delete user.tag;
                delete user.providerId;
                delete user.inProgress;

                return user;
            })[0];
        });

        describe('When a request is made for verify two factor auth - success', () => {
            beforeAll(() => {
                user.twoFactorSecret.qrcode = 'test';

                jest.spyOn(User, 'findOne').mockResolvedValue(user);
                jest.spyOn(User, 'update').mockResolvedValue(updatedInProgressToDone);
                jest.spyOn(speakeasy.totp, 'verify').mockReturnValue(true);
                next = jest.fn();
            });

            afterAll(() => {
                jest.clearAllMocks();
            });

            it('should be successful if is a valid token', async () => {
                request.query = { token: '123456' };
                request.params = { id: '123456789123456789123456' };
                await authorizationMiddleware.twoFactor(request, response, next);

                expect(next).toHaveBeenCalled();
            });
        });

        describe('and the params are incorrect - userId', () => {
            beforeAll(() => {
                jest.spyOn(User, 'findOne').mockResolvedValue(null);
            });

            it('should throw 404 error - Not Found', async () => {
                try {
                    request.query = { code: '123456' };
                    request.params = { id: '' };
                    await authorizationMiddleware.twoFactor(request, response, next);

                    expect('it should not be here').toBe(true);
                } catch (error) {
                    const err = error as HttpRequestErrors;

                    expect(err.message).toStrictEqual('User does not exist');
                    expect(err.name).toBe('NotFound');
                    expect(err.code).toBe(404);
                }
            });

            describe('and the two factor auth is deactivated', () => {
                beforeAll(() => {
                    const userWithTwoFactorDeactivated = JSON.parse(JSON.stringify(user));
                    userWithTwoFactorDeactivated.twoFactorSecret.active = false;
                    jest.spyOn(User, 'findOne').mockResolvedValue(userWithTwoFactorDeactivated);
                    next = jest.fn();
                });

                it('should call next', async () => {
                    request.params = { id: '123456789123456789123456' };
                    await authorizationMiddleware.twoFactor(request, response, next);

                    expect(next).toHaveBeenCalled();
                });
            });

            describe('and the params are incorrect - token', () => {
                beforeAll(() => {
                    jest.spyOn(User, 'findOne').mockResolvedValue(user);
                    jest.spyOn(User, 'update').mockResolvedValue(updatedInProgressToDone);
                    jest.spyOn(speakeasy.totp, 'verify').mockReturnValue(false);
                });

                it('should throw 401 error - Wrong token', async () => {
                    try {
                        request.query = { token: '123456' };
                        request.params = { id: '123456789123456789123456' };
                        await authorizationMiddleware.twoFactor(request, response, next);
                        expect('it should not be here').toBe(true);
                    } catch (error) {
                        const err = error as HttpRequestErrors;

                        expect(err.message).toStrictEqual('Two factor code does not match');
                        expect(err.name).toBe('Unauthorized');
                        expect(err.code).toBe(401);
                    }
                });
            });

            it('should throw 400 error - Invalid type of code', async () => {
                try {
                    request.query = { code: ['123456'] };
                    request.params = { id: '123456789123456789123456' };
                    await authorizationMiddleware.twoFactor(request, response, next);
                    expect('it should not be here').toBe(true);
                } catch (error) {
                    const err = error as HttpRequestErrors;

                    expect(err.message).toStrictEqual('Query must be a string');
                    expect(err.name).toBe('BadRequest');
                    expect(err.code).toBe(400);
                }
            });
        });
    });
});