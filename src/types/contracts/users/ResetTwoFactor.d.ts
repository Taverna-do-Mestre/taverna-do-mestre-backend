import ResetTwoFactorService from 'src/core/users/services/ResetTwoFactorService';
import HttpRequestErrors from 'src/infra/helpers/common/HttpRequestErrors';
import UsersRepository from 'src/infra/repositories/user/UsersRepository';
import { Logger } from 'src/types/Logger';

export abstract class ResetTwoFactorOperationContract {
    resetTwoFactorService: ResetTwoFactorService;
    logger: Logger;
}

export abstract class ResetTwoFactorServiceContract {
    usersRepository: UsersRepository;
    httpRequestErrors: HttpRequestErrors;
    logger: Logger;
}
