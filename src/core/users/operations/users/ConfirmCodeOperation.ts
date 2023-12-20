import { ConfirmCodeOperationContract } from 'src/types/users/contracts/core/ConfirmCode';
import { ConfirmCodePayload } from 'src/types/users/requests/Payload';
import { ConfirmCodeResponse } from 'src/types/users/requests/Response';

export default class ConfirmCodeOperation {
    private readonly _confirmCodeService;
    private readonly _logger;

    constructor({ confirmCodeService, logger }: ConfirmCodeOperationContract) {
        this._confirmCodeService = confirmCodeService;
        this._logger = logger;

        this.execute = this.execute.bind(this);
    }

    public async execute({
        userId,
        code,
    }: ConfirmCodePayload): Promise<ConfirmCodeResponse> {
        this._logger('info', 'Execute - ConfirmCodeOperation');
        return this._confirmCodeService.processCode({
            userId,
            code,
        });
    }
}
