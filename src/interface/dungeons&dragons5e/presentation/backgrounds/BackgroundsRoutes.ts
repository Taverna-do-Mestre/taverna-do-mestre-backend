import 'src/interface/common/strategies/BearerStrategy';
import passport from 'passport';
import { routeInstance } from '@tablerise/auto-swagger';
import generateIDParam, {
    generateQueryParam,
} from 'src/infra/helpers/user/parametersWrapper';
import { BackgroundsRoutesContract } from 'src/types/dungeons&dragons5e/contracts/presentation/backgrounds/BackgroundsRoutes';

const BASE_PATH = '/dnd5e/backgrounds';

export default class BackgroundsRoutes {
    private readonly _backgroundsController;
    private readonly _verifyIdMiddleware;
    private readonly _verifyBooleanQueryMiddleware;

    constructor({
        backgroundsController,
        verifyIdMiddleware,
        verifyBooleanQueryMiddleware,
    }: BackgroundsRoutesContract) {
        this._backgroundsController = backgroundsController;
        this._verifyIdMiddleware = verifyIdMiddleware;
        this._verifyBooleanQueryMiddleware = verifyBooleanQueryMiddleware;
    }

    public routes(): routeInstance[] {
        return [
            {
                method: 'get',
                path: `${BASE_PATH}`,
                controller: this._backgroundsController.getAll,
                options: {
                    middlewares: [passport.authenticate('bearer', { session: false })],
                    authentication: true,
                    tag: 'backgrounds',
                },
            },
            {
                method: 'get',
                path: `${BASE_PATH}/disabled`,
                controller: this._backgroundsController.getDisabled,
                options: {
                    middlewares: [passport.authenticate('bearer', { session: false })],
                    authentication: true,
                    tag: 'backgrounds',
                },
            },
            {
                method: 'get',
                path: `${BASE_PATH}/:id`,
                parameters: [...generateIDParam()],
                controller: this._backgroundsController.get,
                options: {
                    middlewares: [
                        this._verifyIdMiddleware,
                        passport.authenticate('bearer', { session: false }),
                    ],
                    authentication: true,
                    tag: 'backgrounds',
                },
            },
            {
                method: 'patch',
                path: `${BASE_PATH}/:id`,
                parameters: [
                    ...generateIDParam(),
                    ...generateQueryParam(1, [{ name: 'availability', type: 'boolean' }]),
                ],
                controller: this._backgroundsController.toggleAvailability,
                options: {
                    middlewares: [
                        this._verifyIdMiddleware,
                        passport.authenticate('bearer', { session: false }),
                    ],
                    authentication: true,
                    tag: 'backgrounds',
                },
            },
        ] as unknown as routeInstance[];
    }
}