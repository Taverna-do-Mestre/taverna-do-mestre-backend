import { DnDGod, MongoModel, Internacional, SchemasDnDType } from '@tablerise/database-management';
import Service from 'src/types/Service';
import { Logger } from 'src/types/Logger';
import ValidateData from 'src/support/helpers/ValidateData';
import { ErrorMessage } from 'src/support/helpers/errorMessage';
import UpdateResponse from 'src/types/UpdateResponse';
import { HttpStatusCode } from 'src/support/helpers/HttpStatusCode';

export default class GodsServices implements Service<Internacional<DnDGod>> {
    constructor(
        private readonly _model: MongoModel<Internacional<DnDGod>>,
        private readonly _logger: Logger,
        private readonly _validate: ValidateData,
        private readonly _schema: SchemasDnDType
    ) {}

    public async findAll(): Promise<Array<Internacional<DnDGod>>> {
        const response = await this._model.findAll({ active: true });

        this._logger('info', 'All god entities found with success');
        return response;
    }

    public async findAllDisabled(): Promise<Array<Internacional<DnDGod>>> {
        const response = await this._model.findAll({ active: false });

        this._logger('info', 'All god entities found with success');
        return response;
    }

    public async findOne(_id: string): Promise<Internacional<DnDGod>> {
        const response = await this._model.findOne(_id);

        if (!response) throw this._validate._generateError(HttpStatusCode.NOT_FOUND, ErrorMessage.NOT_FOUND_BY_ID);

        this._logger('info', 'God entity found with success');
        return response;
    }

    public async update(_id: string, payload: Internacional<DnDGod>): Promise<Internacional<DnDGod>> {
        const { helpers, godZod } = this._schema;
        this._validate.entry(helpers.languagesWrapperSchema(godZod), payload);

        this._validate.existance(payload.active, ErrorMessage.BAD_REQUEST);

        const response = await this._model.update(_id, payload);

        if (!response) throw this._validate._generateError(HttpStatusCode.NOT_FOUND, ErrorMessage.NOT_FOUND_BY_ID);

        this._logger('info', 'God entity updated with success');

        return response;
    }

    public async updateAvailability(_id: string, query: boolean): Promise<UpdateResponse> {
        const response = await this._model.findOne(_id);

        if (!response) throw this._validate._generateError(HttpStatusCode.NOT_FOUND, ErrorMessage.NOT_FOUND_BY_ID);

        this._validate.existance(response.active === query, ErrorMessage.BAD_REQUEST);

        response.active = query;
        await this._model.update(_id, response);

        const responseMessage = {
            message: `God ${response._id as string} was ${query ? 'activated' : 'deactivated'}`,
            name: 'success',
        };

        this._logger('info', `God availability ${query ? 'activated' : 'deactivated'} with success`);
        return responseMessage;
    }
}
