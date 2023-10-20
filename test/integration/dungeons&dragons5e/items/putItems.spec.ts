import requester from '../../../support/requester';
import DatabaseManagement, { MongoModel, mongoose } from '@tablerise/database-management';
import { HttpStatusCode } from 'src/infra/helpers/common/HttpStatusCode';
import mocks from 'src/infra/mocks/dungeons&dragons5e';
import generateNewMongoID from 'src/support/helpers/generateNewMongoID';

import { Item } from 'src/schemas/dungeons&dragons5e/itemsValidationSchema';
import { Internacional } from 'src/infra/helpers/common/languagesWrapperZod';
import logger from '@tablerise/dynamic-logger';

describe('Put RPG Items in database', () => {
    let model: MongoModel<Internacional<Item>>;
    const item = mocks.item.instance as Internacional<Item>;
    const { _id: _, ...itemPayload } = item;

    const newItemPayload = {
        en: { ...itemPayload.en, name: 'Item_testPut' },
        pt: { ...itemPayload.pt, name: 'Item_testPut' },
    };

    let documentId: string;

    beforeAll(() => {
        DatabaseManagement.connect(true)
            .then(() => {
                logger('info', 'Test database connection instanciated');
            })
            .catch(() => {
                logger('error', 'Test database connection failed');
            });

        const database = new DatabaseManagement();
        model = database.modelInstance('dungeons&dragons5e', 'Items');
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('When update one rpg Item', () => {
        it('should return updated Item', async () => {
            const keysToTest = Object.keys(item.en);

            const response = await model.create(itemPayload);
            documentId = response._id as string;

            const { body } = await requester()
                .put(`/dnd5e/items/${documentId}`)
                .send(newItemPayload)
                .expect(HttpStatusCode.OK);

            expect(body).toHaveProperty('_id');

            keysToTest.forEach((key) => {
                expect(body.en).toHaveProperty(key);
                expect(body.pt).toHaveProperty(key);
            });

            expect(body.en.name).toBe('Item_testPut');
            expect(body.pt.name).toBe('Item_testPut');
        });

        it('should fail when data is wrong', async () => {
            const { body } = await requester()
                .put(`/dnd5e/items/${documentId}`)
                .send({ data: null } as unknown as Internacional<Item>)
                .expect(HttpStatusCode.UNPROCESSABLE_ENTITY);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.details[0].attribute).toBe('en');
            expect(body.details[0].reason).toBe('Required');
            expect(body.name).toBe('ValidationError');
        });

        it('should fail when try to change availability', async () => {
            const { body } = await requester()
                .put(`/dnd5e/items/${generateNewMongoID()}`)
                .send({ active: true, ...newItemPayload })
                .expect(HttpStatusCode.BAD_REQUEST);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('Not possible to change availability through this route');
            expect(body.name).toBe('BadRequest');
        });

        it('should fail with inexistent ID', async () => {
            const { body } = await requester()
                .put(`/dnd5e/items/${generateNewMongoID()}`)
                .send(newItemPayload)
                .expect(HttpStatusCode.NOT_FOUND);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('NotFound an object with provided ID');
            expect(body.name).toBe('NotFound');
        });
    });
});
