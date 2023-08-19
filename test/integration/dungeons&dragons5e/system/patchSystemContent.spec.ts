import request from 'supertest';
import app from 'src/app';
import SystemsModel from 'src/database/models/dungeons&dragons5e/SystemModel';
import { HttpStatusCode } from 'src/support/helpers/HttpStatusCode';
import mocks from 'src/support/mocks/dungeons&dragons5e';
import { UpdateContent } from 'src/schemas/updateContentSchema';
import { System } from 'src/schemas/dungeons&dragons5e/systemValidationSchema';
import generateNewMongoID from 'src/support/helpers/generateNewMongoID';
import Connections from 'src/database/DatabaseConnection';

describe('Patch RPG systems in database', () => {
    const model = new SystemsModel();
    const contentPayload = mocks.updateSystemContent.instance as UpdateContent;

    const systemMockInstance = mocks.system.instance as System;
    const { _id: __, ...systemMockPayload } = systemMockInstance;

    let documentId: string;

    afterAll(async () => {
        await Connections['dungeons&dragons5e'].close();
    });

    describe('When update the content of the rpg system', () => {
        it('should return successfull confirmation', async () => {
            const response = await model.create(systemMockPayload);
            documentId = response._id as string;

            const updateResult = `New ID ${contentPayload.newID} was ${contentPayload.method} to array of entities races - system ID: ${documentId}`;

            const { text } = await request(app)
                .patch(`/dnd5e/system/${documentId}?entity=races`)
                .send(contentPayload)
                .expect(HttpStatusCode.CREATED);

            expect(text).toBe(updateResult);
        });

        it('should fail when data is wrong', async () => {
            const { body } = await request(app)
                .patch(`/dnd5e/system/${documentId}?entity=races`)
                .send({ data: null })
                .expect(HttpStatusCode.UNPROCESSABLE_ENTITY);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(JSON.parse(body.message)[0].path[0]).toBe('method');
            expect(JSON.parse(body.message)[0].message).toBe('Required');
            expect(body.name).toBe('ValidationError');
        });

        it('should fail when no entityData', async () => {
            const { body } = await request(app)
                .patch(`/dnd5e/system/${documentId}`)
                .send(contentPayload)
                .expect(HttpStatusCode.BAD_REQUEST);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('Not possible to change availability through this route');
            expect(body.name).toBe('BadRequest');
        });

        it('should fail with inexistent ID', async () => {
            const { body } = await request(app)
                .patch(`/dnd5e/system/${generateNewMongoID()}?entity=races`)
                .send(contentPayload)
                .expect(HttpStatusCode.NOT_FOUND);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('NotFound an object with provided ID');
            expect(body.name).toBe('NotFound');
        });
    });
});
