import 'src/interface/users/strategies/LocalStrategy';
import 'src/interface/users/strategies/BearerStrategy';
import passport from 'passport';
import { routeInstance } from '@tablerise/auto-swagger';
import generateIDParam, { generateQueryParam } from 'src/infra/helpers/user/parametersWrapper';
import mock from 'src/infra/mocks/user';
import { UsersRoutesContract } from 'src/types/contracts/users/presentation/UsersRoutes';

const BASE_PATH = '/profile';

export default class UsersRoutes extends UsersRoutesContract {
    constructor({ usersController, verifyIdMiddleware }: UsersRoutesContract) {
        super();
        this.usersController = usersController;
        this.verifyIdMiddleware = verifyIdMiddleware;
    }

    public routes(): routeInstance[] {
        return [
            {
                method: 'get',
                path: `${BASE_PATH}/:id/verify`,
                parameters: [...generateIDParam()],
                controller: this.usersController.verifyEmail,
                options: {
                    middlewares: [this.verifyIdMiddleware],
                    authentication: false,
                    tag: 'authentication',
                },
            },
            {
                method: 'post',
                path: `${BASE_PATH}/register`,
                controller: this.usersController.register,
                schema: mock.user.userPayload,
                options: {
                    authentication: false,
                    tag: 'register',
                },
            },
            {
                method: 'post',
                path: `${BASE_PATH}/login`,
                controller: this.usersController.login,
                schema: mock.user.userLogin,
                options: {
                    middlewares: [passport.authenticate('local', { session: false })],
                    authentication: false,
                    tag: 'authentication',
                },
            },
            {
                method: 'patch',
                path: `${BASE_PATH}/:id/confirm`,
                parameters: [...generateIDParam(), ...generateQueryParam(1, [{ name: 'code', type: 'string' }])],
                controller: this.usersController.confirmCode,
                options: {
                    middlewares: [this.verifyIdMiddleware],
                    authentication: false,
                    tag: 'register',
                },
            },
            {
                method: 'patch',
                path: `${BASE_PATH}/:id/2fa/activate`,
                parameters: [...generateIDParam()],
                controller: this.usersController.activateTwoFactor,
                options: {
                    middlewares: [this.verifyIdMiddleware, passport.authenticate('bearer', { session: false })],
                    authentication: true,
                    tag: 'management',
                },
            },
            {
                method: 'patch',
                path: `${BASE_PATH}/:id/2fa/reset`,
                parameters: [...generateIDParam(), ...generateQueryParam(1, [{ name: 'code', type: 'string' }])],
                controller: this.usersController.resetTwoFactor,
                options: {
                    middlewares: [this.verifyIdMiddleware, passport.authenticate('bearer', { session: false })],
                    authentication: true,
                    tag: 'management',
                },
            },
            {
                method: 'patch',
                path: `${BASE_PATH}/:id/update/email`,
                parameters: [...generateIDParam(), ...generateQueryParam(1, [{ name: 'code', type: 'string' }])],
                controller: this.usersController.updateEmail,
                options: {
                    middlewares: [this.verifyIdMiddleware, passport.authenticate('bearer', { session: false })],
                    authentication: true,
                    tag: 'management',
                },
            },
        ] as routeInstance[]
    }
}
