import requester from '../../../support/requester';
import DatabaseManagement, { MongoModel, mongoose } from '@tablerise/database-management';
import mocks from 'src/infra/mocks/dungeons&dragons5e';
import { HttpStatusCode } from 'src/infra/helpers/common/HttpStatusCode';
import generateNewMongoID from 'src/support/helpers/generateNewMongoID';

import { Monster } from 'src/schemas/dungeons&dragons5e/monstersValidationSchema';
import { Internacional } from 'src/infra/helpers/common/languagesWrapperZod';
import logger from '@tablerise/dynamic-logger';

describe('Put RPG monsters in database', () => {
    let model: MongoModel<Internacional<Monster>>;
    const monster = mocks.monster.instance as Internacional<Monster>;
    const { _id: _, ...monsterPayload } = monster;

    const newMonsterPayload = {
        en: { ...monsterPayload.en, name: 'Dragon' },
        pt: { ...monsterPayload.pt, name: 'Dragão' },
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
        model = database.modelInstance('dungeons&dragons5e', 'Monsters');
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('When update one rpg monster', () => {
        it('should return updated monster', async () => {
            const keysToTest = ['name', 'characteristics', 'stats', 'abilityScore', 'skills', 'actions', 'picture'];

            const response = await model.create(monsterPayload);
            documentId = response._id as string;

            const { body } = await requester()
                .put(`/dnd5e/monsters/${documentId}`)
                .send(newMonsterPayload)
                .expect(HttpStatusCode.OK);

            expect(body).toHaveProperty('_id');

            keysToTest.forEach((key) => {
                expect(body.en).toHaveProperty(key);
                expect(body.pt).toHaveProperty(key);
            });

            expect(body.en.name).toBe('Dragon');
            expect(body.pt.name).toBe('Dragão');
        });

        it('should fail when data is wrong', async () => {
            const { body } = await requester()
                .put(`/dnd5e/monsters/${documentId}`)
                .send({ data: null } as unknown as Internacional<Monster>)
                .expect(HttpStatusCode.UNPROCESSABLE_ENTITY);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.details[0].attribute).toBe('en');
            expect(body.details[0].reason).toBe('Required');
            expect(body.name).toBe('ValidationError');
        });

        it('should fail when try to change availability', async () => {
            const { body } = await requester()
                .put(`/dnd5e/monsters/${generateNewMongoID()}`)
                .send({ active: true, ...newMonsterPayload })
                .expect(HttpStatusCode.BAD_REQUEST);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('Not possible to change availability through this route');
            expect(body.name).toBe('BadRequest');
        });

        it('should fail with inexistent ID', async () => {
            const { body } = await requester()
                .put(`/dnd5e/monsters/${generateNewMongoID()}`)
                .send(newMonsterPayload)
                .expect(HttpStatusCode.NOT_FOUND);

            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('name');
            expect(body.message).toBe('NotFound an object with provided ID');
            expect(body.name).toBe('NotFound');
        });
    });
});
