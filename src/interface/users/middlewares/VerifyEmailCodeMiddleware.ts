import { NextFunction, Request, Response } from 'express';
import { UserInstance } from 'src/domains/users/schemas/usersValidationSchema';
import HttpRequestErrors from 'src/domains/common/helpers/HttpRequestErrors';
import { HttpStatusCode } from 'src/domains/common/helpers/HttpStatusCode';
import InterfaceDependencies from 'src/types/modules/interface/InterfaceDependencies';
import { stateFlowsKeys } from 'src/domains/common/enums/stateFlowsEnum';
import { UserDetailInstance } from 'src/domains/users/schemas/userDetailsValidationSchema';

export default class VerifyEmailCodeMiddleware {
    private readonly _usersRepository;
    private readonly _usersDetailsRepository;
    private readonly _stateMachine;
    private readonly _logger;
    private readonly _ALLOWED_STATUS;

    constructor({
        usersRepository,
        usersDetailsRepository,
        logger,
    }: InterfaceDependencies['verifyEmailCodeMiddlewareContract']) {
        this._usersRepository = usersRepository;
        this._usersDetailsRepository = usersDetailsRepository;
        stateMachine,
        logger,
    }: InterfaceDependencies['verifyEmailCodeMiddlewareContract']) {
        this._usersRepository = usersRepository;
        this._stateMachine = stateMachine;
        this._logger = logger;

        this._ALLOWED_STATUS = [
            stateMachine.props.status.DONE,
            stateMachine.props.status.WAIT_TO_CONFIRM,
            stateMachine.props.status.WAIT_TO_START_EMAIL_CHANGE,
            stateMachine.props.status.WAIT_TO_START_PASSWORD_CHANGE,
            stateMachine.props.status.WAIT_TO_START_RESET_TWO_FACTOR,
        ];

        this.verify = this.verify.bind(this);
    }

    private async _getUserToValidate(id: string, email: string): Promise<UserInstance> {
        if (!id && !email)
            throw new HttpRequestErrors({
                message: 'Neither id or email was provided to validate the email code',
                code: HttpStatusCode.BAD_REQUEST,
                name: 'BadRequest',
            });

        if (id) return this._usersRepository.findOne({ userId: id });

        return this._usersRepository.findOne({ email });
    }

    public async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
        this._logger('warn', 'Verify - VerifyEmailCodeMiddleware');

        const { id } = req.params;
        const { email, code, flow } = req.query;

        this._logger('info', `Code from Request is = ${code as string}`);

        let userInDb = {} as UserInstance;
        let userDetailsInDb = {} as UserDetailInstance;

        const userInDb = await this._getUserToValidate(id, email as string);

        if (id) {
            userInDb = await this._usersRepository.findOne({ userId: id });
            userDetailsInDb = await this._usersDetailsRepository.findOne({ userId: id });
        }

        if (email && !id) {
            userInDb = await this._usersRepository.findOne({ email });
            userDetailsInDb = await this._usersDetailsRepository.findOne({
                userId: userInDb.userId,
            });
        }

        this._logger('info', `Code in Database is = ${userInDb.inProgress.code}`);
        this._logger('info', `User status = ${userInDb.inProgress.status}`);

        if (!this._ALLOWED_STATUS.includes(userInDb.inProgress.status))
            HttpRequestErrors.throwError('invalid-user-status');

        if (code !== userInDb.inProgress.code)
            HttpRequestErrors.throwError('invalid-email-verify-code');

        const userVerified = await this._stateMachine.machine(
            flow as stateFlowsKeys,
            userInDb
        );

        res.locals = {
            userId: userVerified.userId,
            userStatus: userVerified.inProgress.status,
            accountSecurityMethod: !userVerified.twoFactorSecret.active
                ? 'secret-question'
                : 'two-factor',
            ...(!userInDb.twoFactorSecret.active
                ? { secretQuestion: userDetailsInDb.secretQuestion?.question }
                : {}),
            lastUpdate: userVerified.updatedAt,
        };

        next();
    }
}
