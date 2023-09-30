import { MongoModel } from '@tablerise/database-management';
import Service from 'src/types/Service';
import { Logger } from 'src/types/Logger';
import SchemaValidator from 'src/services/helpers/SchemaValidator';
import { ErrorMessage } from 'src/services/helpers/errorMessage';
import UpdateResponse from 'src/types/UpdateResponse';
import { SchemasDnDType } from 'src/schemas';
import { Realm } from 'src/schemas/dungeons&dragons5e/realmsValidationSchema';
import { Internacional } from 'src/schemas/languagesWrapperSchema';
import HttpRequestErrors from 'src/services/helpers/HttpRequestErrors';
export default class RealmsServices implements Service<Internacional<Realm>> {
    constructor(
        private readonly _model: MongoModel<Internacional<Realm>>,
        private readonly _logger: Logger,
        private readonly _validate: SchemaValidator,
        private readonly _schema: SchemasDnDType
    ) {}

    public async findAll(): Promise<Array<Internacional<Realm>>> {
        const response = await this._model.findAll({ active: true });

        this._logger('info', 'All realm entities found with success');
        return response;
    }

    public async findAllDisabled(): Promise<Array<Internacional<Realm>>> {
        const response = await this._model.findAll({ active: false });

        this._logger('info', 'All realm entities found with success');
        return response;
    }

    public async findOne(_id: string): Promise<Internacional<Realm>> {
        const response = (await this._model.findOne(_id)) as Internacional<Realm>;

        this._logger('info', 'Realm entity found with success');
        if (!response) HttpRequestErrors.throwError('rpg-not-found-id');
        return response;
    }

    public async update(_id: string, payload: Internacional<Realm>): Promise<Internacional<Realm>> {
        const { helpers, realmZod } = this._schema;
        this._validate.entry(helpers.languagesWrapperSchema(realmZod), payload);

        this._validate.existance(payload.active, ErrorMessage.BAD_REQUEST);

        const response = (await this._model.update(_id, payload)) as Internacional<Realm>;

        this._logger('info', 'Realm entity updated with success');
        if (!response) HttpRequestErrors.throwError('rpg-not-found-id');

        return response;
    }

    public async updateAvailability(_id: string, query: boolean): Promise<UpdateResponse> {
        const response = (await this._model.findOne(_id)) as Internacional<Realm>;

        if (!response) HttpRequestErrors.throwError('rpg-not-found-id');

        this._validate.existance(response.active === query, ErrorMessage.BAD_REQUEST);

        response.active = query;
        await this._model.update(_id, response);

        const responseMessage = {
            message: `Realm ${response._id as string} was ${query ? 'activated' : 'deactivated'}`,
            name: 'success',
        };

        this._logger('info', `Realm availability ${query ? 'activated' : 'deactivated'} with success`);
        return responseMessage;
    }
}
