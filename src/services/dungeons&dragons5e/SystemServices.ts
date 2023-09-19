import { MongoModel } from '@tablerise/database-management';
import Service from 'src/types/Service';
import ValidateData from 'src/support/helpers/ValidateData';
import { Logger } from 'src/types/Logger';
import { ErrorMessage } from 'src/support/helpers/errorMessage';
import { HttpStatusCode } from 'src/support/helpers/HttpStatusCode';
import { SchemasDnDType } from 'src/schemas';
import { System } from 'src/schemas/dungeons&dragons5e/systemValidationSchema';
import { UpdateContent } from 'src/schemas/updateContentSchema';

export default class SystemServices implements Service<System> {
    constructor(
        private readonly _model: MongoModel<System>,
        private readonly _logger: Logger,
        private readonly _validate: ValidateData,
        private readonly _schema: SchemasDnDType
    ) {}

    public async findAll(): Promise<System[]> {
        const response = await this._model.findAll();

        this._logger('info', 'All system entities found with success');
        return response;
    }

    public async findOne(_id: string): Promise<System> {
        const response = await this._model.findOne(_id);

        this._logger('info', 'System entity found with success');
        if (!response) throw this._validate._generateError(HttpStatusCode.NOT_FOUND, ErrorMessage.NOT_FOUND_BY_ID);

        return response;
    }

    public async update(_id: string, payload: any): Promise<System> {
        const { systemZod } = this._schema;
        this._validate.entry(systemZod.systemPayloadZodSchema, payload);
        this._validate.existance(!!payload.content, ErrorMessage.BAD_REQUEST);

        const response = await this._model.update(_id, payload);
        if (!response) throw this._validate._generateError(HttpStatusCode.NOT_FOUND, ErrorMessage.NOT_FOUND_BY_ID);
        this._logger('info', 'System entity updated with success');

        return response;
    }

    public async updateContent(_id: string, entityQuery: string, payload: any): Promise<string> {
        const { updateContentZodSchema } = this._schema;

        this._validate.entry(updateContentZodSchema, payload);
        this._validate.existance(!entityQuery, ErrorMessage.BAD_REQUEST);

        const { method, newID } = payload as UpdateContent;

        const recoverSystem = (await this._model.findOne(_id)) as System & { _id: string };

        if (!recoverSystem) throw this._validate._generateError(HttpStatusCode.NOT_FOUND, ErrorMessage.NOT_FOUND_BY_ID);

        if (recoverSystem && method === 'add') {
            // @ts-expect-error => The SystemContent is possible undefined when import from lib but will never be undefined
            recoverSystem.content[entityQuery as keyof SystemContent].push(newID);
        }

        if (recoverSystem && method === 'remove') {
            // @ts-expect-error => The SystemContent is possible undefined when import from lib but will never be undefined
            const removeIdFromContent = recoverSystem.content[entityQuery as keyof SystemContent].filter(
                (id: string) => id !== newID
            );

            // @ts-expect-error => The SystemContent is possible undefined when import from lib but will never be undefined
            recoverSystem.content[entityQuery as keyof SystemContent] = removeIdFromContent;
        }

        await this._model.update(_id, recoverSystem);

        const response = `New ID ${newID} was ${method as string} to array of entities ${entityQuery} - system ID: ${
            recoverSystem._id
        }`;

        this._logger('info', 'Content of the system entity updated with success');
        return response;
    }

    public async activate(_id: string): Promise<string> {
        const response = (await this._model.findOne(_id)) as System & { _id: string };

        if (!response) throw this._validate._generateError(HttpStatusCode.NOT_FOUND, ErrorMessage.NOT_FOUND_BY_ID);

        this._validate.existance(response.active, ErrorMessage.BAD_REQUEST);

        response.active = true;

        await this._model.update(_id, response);

        this._logger('info', 'System entity activated with success');

        return `System ${response._id} was activated`;
    }

    public async deactivate(_id: string): Promise<string> {
        const response = (await this._model.findOne(_id)) as System & { _id: string };

        if (!response) throw this._validate._generateError(HttpStatusCode.NOT_FOUND, ErrorMessage.NOT_FOUND_BY_ID);

        this._validate.existance(!response.active, ErrorMessage.BAD_REQUEST);

        response.active = true;
        await this._model.update(_id, response);

        this._logger('info', 'System entity deactivated with success');
        return `System ${response._id} was deactivated`;
    }
}
