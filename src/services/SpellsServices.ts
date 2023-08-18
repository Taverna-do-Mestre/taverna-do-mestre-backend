import SpellsModel from 'src/database/models/SpellsModel';
import Service from 'src/types/Service';
import spellsZodSchema, { Spell } from 'src/schemas/spellsValidationSchema';
import languagesWrapper, { Internacional } from 'src/schemas/languagesWrapperSchema';
import { LoggerType } from 'src/types/LoggerType';
import UpdateResponse from 'src/types/UpdateResponse';
import ValidateData from 'src/support/helpers/ValidateData';
import { ErrorMessage } from 'src/support/helpers/errorMessage';

export default class SpellsServices implements Service<Internacional<Spell>> {
    constructor(
        private readonly _model: SpellsModel,
        private readonly _logger: LoggerType,
        private readonly _validate: ValidateData
    ) {}

    public async findAll(): Promise<Array<Internacional<Spell>>> {
        const response = await this._model.findAll({ active: true });

        this._logger('info', 'All spell entities found with success');
        return response;
    }

    public async findAllDisabled(): Promise<Array<Internacional<Spell>>> {
        const response = await this._model.findAll({ active: false });

        this._logger('info', 'All spell entities found with success');
        return response;
    }

    public async findOne(_id: string): Promise<Internacional<Spell>> {
        const response = await this._model.findOne(_id);

        this._logger('info', 'Spell entity found with success');
        this._validate.response(response, ErrorMessage.NOT_FOUND_BY_ID);

        return response as Internacional<Spell>;
    }

    public async update(_id: string, payload: Internacional<Spell>): Promise<Internacional<Spell>> {
        this._validate.entry(languagesWrapper(spellsZodSchema), payload);

        this._validate.existance(payload.active, ErrorMessage.BAD_REQUEST);

        const response = await this._model.update(_id, payload);

        this._logger('info', 'Spell entity updated with success');
        this._validate.response(response, ErrorMessage.NOT_FOUND_BY_ID);

        return response as Internacional<Spell>;
    }

    public async updateAvailability(_id: string, query: boolean): Promise<UpdateResponse> {
        const response = await this._model.findOne(_id);

        this._validate.response(response, ErrorMessage.NOT_FOUND_BY_ID);

        this._validate.existance(response?.active === query, ErrorMessage.BAD_REQUEST);

        if (response) response.active = query;
        await this._model.update(_id, response as Internacional<Spell>);

        const responseMessage = {
            message: `Spell ${response?._id as string} was ${query ? 'activated' : 'deactivated'}`,
            name: 'success',
        };

        this._logger('info', `Spell availability ${query ? 'activated' : 'deactivated'} with success`);
        return responseMessage;
    }
}
