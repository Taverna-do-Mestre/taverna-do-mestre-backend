import 'express-async-errors';

import express from 'express';
import session from 'cookie-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import helmet from 'helmet';
import { ApplicationContract } from 'src/types/modules/core/Application';
import DatabaseManagement from '@tablerise/database-management';
import { createServer } from 'http';

export default class Application {
    private readonly _dungeonsAndDragonsRoutesMiddleware;
    private readonly _usersRoutesMiddleware;
    private readonly _swaggerGenerator;
    private readonly _accessHeadersMiddleware;
    private readonly _errorMiddleware;
    private readonly _socketIO;
    private readonly _logger;

    constructor({
        dungeonsAndDragonsRoutesMiddleware,
        usersRoutesMiddleware,
        errorMiddleware,
        swaggerGenerator,
        accessHeadersMiddleware,
        socketIO,
        logger,
    }: ApplicationContract) {
        this._dungeonsAndDragonsRoutesMiddleware = dungeonsAndDragonsRoutesMiddleware;
        this._usersRoutesMiddleware = usersRoutesMiddleware;
        this._swaggerGenerator = swaggerGenerator;
        this._accessHeadersMiddleware = accessHeadersMiddleware;
        this._errorMiddleware = errorMiddleware;
        this._socketIO = socketIO;
        this._logger = logger;
    }

    public setupExpress(): express.Application {
        const app = express();

        app.use(express.json())
            .use(cors({
                origin: '*',
                credentials: true
            }))
            .use(cookieParser())
            .use(helmet())
            .use(session({ secret: (process.env.COOKIE_SECRET as string) || 'catfish' }))
            .use(passport.session())
            .use('/health', (req, res) => res.send('OK!'))
            .use(this._swaggerGenerator)
            .use(this._accessHeadersMiddleware)
            .use(this._usersRoutesMiddleware.get())
            .use(this._dungeonsAndDragonsRoutesMiddleware.get())
            .use(this._errorMiddleware);

        return app;
    }

    public async start(): Promise<void> {
        const port = process.env.PORT as string;
        const app = this.setupExpress();
        const server = createServer(app);

        await this._socketIO.connect(server);

        await DatabaseManagement.connect(true, 'mongoose')
            .then(() => {
                this._logger(
                    'info',
                    '[ Application - Database connection instanciated ]',
                    true
                );
            })
            .catch(() => {
                this._logger('error', '[ Application - Database connection failed ]');
            });

        server.listen(port, () => {
            this._logger(
                'info',
                `[ Application - Server started in port -> ${port} ]`,
                true
            );
        });
    }
}
