import requester from '../../../support/requester';
import DatabaseManagement, { DnDRealm, Internacional, mongoose, MongoModel } from '@tablerise/database-management';
import { HttpStatusCode } from 'src/support/helpers/HttpStatusCode';
import mocks from 'src/support/mocks/dungeons&dragons5e';
import generateNewMongoID from 'src/support/helpers/generateNewMongoID';

const logger = require('@tablerise/dynamic-logger');

describe('Patch RPG realms in database', () => {
    let model: MongoModel<Internacional<DnDRealm>>;
    const _realm = mocks.realm.instance as Internacional<DnDRealm>;
    const { _id: _, ...realmPayload } = _realm;

    let documentId: string;

    beforeAll(() => {
        DatabaseManagement.connect(true)
            .then(() => logger('info', 'Test database connection instanciated'))
            .catch(() => logger('error', 'Test database connection failed'));

        const DM = new DatabaseManagement();
        model = DM.modelInstance('dungeons&dragons5e', 'Realms');
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('When update availability one rpg realm', () => {
        it('should return a string with realm updated id', async () => {
            const response = await model.create(realmPayload);
            documentId = response._id as string;

            const { body } = await requester
                .patch(`/dnd5e/realms/${documentId}?availability=false`)
                .expect(HttpStatusCode.OK);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe(`Realm ${documentId} was deactivated`);
            expect(body.name).toBe('success');
        });

        it('should fail when availability already enabled', async () => {
            const response = await model.create(realmPayload);
            documentId = response._id as string;

            const { body } = await requester
                .patch(`/dnd5e/realms/${documentId}?availability=true`)
                .expect(HttpStatusCode.BAD_REQUEST);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('Not possible to change availability through this route');
            expect(body.name).toBe('BadRequest');
        });

        it('should fail when availability already disabled', async () => {
            await requester.patch(`/dnd5e/realms/${documentId}?availability=false`);

            const { body } = await requester
                .patch(`/dnd5e/realms/${documentId}?availability=false`)
                .expect(HttpStatusCode.BAD_REQUEST);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('Not possible to change availability through this route');
            expect(body.name).toBe('BadRequest');
        });

        it('should fail when query is wrong', async () => {
            const { body } = await requester
                .patch(`/dnd5e/realms/${documentId}?availability=wrongQuery`)
                .expect(HttpStatusCode.BAD_REQUEST);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('The query is invalid');
            expect(body.name).toBe('Invalid Entry');
        });

        it('should fail with inexistent ID', async () => {
            const { body } = await requester
                .patch(`/dnd5e/realms/${generateNewMongoID()}?availability=false`)
                .expect(HttpStatusCode.NOT_FOUND);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('NotFound an object with provided ID');
            expect(body.name).toBe('NotFound');
        });
    });
});
