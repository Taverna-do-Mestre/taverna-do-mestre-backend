import RealmsModel from 'src/database/models/RealmsModel';
import Service from 'src/types/Service';
import realmZodSchema, { Realm } from 'src/schemas/realmsValidationSchema';
import languagesWrapper, { Internacional } from 'src/schemas/languagesWrapperSchema';
import { HttpStatusCode } from 'src/support/helpers/HttpStatusCode';
import ValidateEntry from 'src/support/helpers/ValidateEntry';
import { LoggerType } from 'src/types/LoggerType';

export default class RealmsServices extends ValidateEntry implements Service<Internacional<Realm>> {
    constructor(
        private readonly _model: RealmsModel,
        private readonly _logger: LoggerType
    ) {
        super();
    }

    public async findAll(): Promise<Array<Internacional<Realm>>> {
        const response = await this._model.findAll();

        this._logger('success', 'All realm entities found with success');
        return response;
    }

    public async findOne(_id: string): Promise<Internacional<Realm>> {
        const response = await this._model.findOne(_id);

        if (!response) {
            const err = new Error('NotFound a realm with provided ID');
            err.stack = HttpStatusCode.NOT_FOUND.toString();
            err.name = 'NotFound';
        
            this._logger('error', err.message);
            throw err;
        }

        this._logger('success', 'Realm entity found with success');
        return response;
    }

    public async update(_id: string, payload: Internacional<Realm>): Promise<Internacional<Realm>> {
        this.validate(languagesWrapper(realmZodSchema), payload);

        const response = await this._model.update(_id, payload);

        if (!response) {
            const err = new Error('NotFound a realm with provided ID');
            err.stack = HttpStatusCode.NOT_FOUND.toString();
            err.name = 'NotFound';
        
            this._logger('error', err.message);
            throw err;
        }

        this._logger('success', 'Realm entity updated with success');
        return response;
    }

    public async delete(_id: string): Promise<void> {
        const response = await this._model.findOne(_id);

        if (!response) {
            const err = new Error('NotFound a realm with provided ID');
            err.stack = HttpStatusCode.NOT_FOUND.toString();
            err.name = 'NotFound';

            throw err;
        }

        await this._model.delete(_id);
    }
}
