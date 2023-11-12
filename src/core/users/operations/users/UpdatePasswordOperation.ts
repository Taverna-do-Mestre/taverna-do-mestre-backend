import { UpdatePasswordOperationContract } from 'src/types/users/contracts/core/UpdatePassword';
import { UpdatePasswordPayload } from 'src/types/users/requests/Payload';

export default class UpdatePasswordOperation {
    private readonly _updatePasswordService;
    private readonly _schemaValidator;
    private readonly _usersSchema;
    private readonly _logger;

    constructor({
        usersSchema,
        updatePasswordService,
        schemaValidator,
        logger,
    }: UpdatePasswordOperationContract) {
        this._updatePasswordService = updatePasswordService;
        this._schemaValidator = schemaValidator;
        this._usersSchema = usersSchema;
        this._logger = logger;

        this.execute = this.execute.bind(this);
    }

    public async execute({
        userId,
        code,
        password,
    }: UpdatePasswordPayload): Promise<void> {
        this._logger('info', 'Execute - UpdatePasswordOperation');
        this._schemaValidator.entry(this._usersSchema.passwordUpdateZod, { password });
        await this._updatePasswordService.update({ userId, code, password });
    }
}