import request from 'supertest';
import app from 'src/app';
import FeatsModel from 'src/database/models/dungeons&dragons5e/FeatsModel';
import { HttpStatusCode } from 'src/support/helpers/HttpStatusCode';
import { Internacional } from 'src/schemas/languagesWrapperSchema';
import { Feat } from 'src/schemas/dungeons&dragons5e/featsValidationSchema';
import mocks from 'src/support/mocks/dungeons&dragons5e';
import generateNewMongoID from 'src/support/helpers/generateNewMongoID';
import Connections from 'src/database/DatabaseConnection';

describe('Patch RPG feats in database', () => {
    const model = new FeatsModel();
    const feat = mocks.feat.instance as Internacional<Feat>;
    const { _id: _, ...featPayload } = feat;

    let documentId: string;

    afterAll(async () => {
        await Connections['dungeons&dragons5e'].close();
    });

    describe('When update availability one rpg feat', () => {
        it('should return a string with feat updated id', async () => {
            const response = await model.create(featPayload);
            documentId = response._id as string;

            const { body } = await request(app)
                .patch(`/dnd5e/feats/${documentId}?availability=false`)
                .expect(HttpStatusCode.OK);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe(`Feat ${documentId} was deactivated`);
            expect(body.name).toBe('success');
        });

        it('should fail when availability already enabled', async () => {
            const response = await model.create(featPayload);
            documentId = response._id as string;

            const { body } = await request(app)
                .patch(`/dnd5e/feats/${documentId}?availability=true`)
                .expect(HttpStatusCode.BAD_REQUEST);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('Not possible to change availability through this route');
            expect(body.name).toBe('BadRequest');
        });

        it('should fail when availability already disabled', async () => {
            await request(app).patch(`/dnd5e/feats/${documentId}?availability=false`);

            const { body } = await request(app)
                .patch(`/dnd5e/feats/${documentId}?availability=false`)
                .expect(HttpStatusCode.BAD_REQUEST);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('Not possible to change availability through this route');
            expect(body.name).toBe('BadRequest');
        });

        it('should fail when query is wrong', async () => {
            const { body } = await request(app)
                .patch(`/dnd5e/feats/${documentId}?availability=wrongQuery`)
                .expect(HttpStatusCode.BAD_REQUEST);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('The query is invalid');
            expect(body.name).toBe('Invalid Entry');
        });

        it('should fail with inexistent ID', async () => {
            const { body } = await request(app)
                .patch(`/dnd5e/feats/${generateNewMongoID()}?availability=false`)
                .expect(HttpStatusCode.NOT_FOUND);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('NotFound an object with provided ID');
            expect(body.name).toBe('NotFound');
        });
    });
});
