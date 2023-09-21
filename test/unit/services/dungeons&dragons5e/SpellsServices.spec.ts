import DatabaseManagement from '@tablerise/database-management';
import SpellsServices from 'src/services/dungeons&dragons5e/SpellsServices';
import mocks from 'src/support/mocks/dungeons&dragons5e';
import ValidateData from 'src/support/helpers/ValidateData';

import logger from '@tablerise/dynamic-logger';
import { Spell } from 'src/schemas/dungeons&dragons5e/spellsValidationSchema';
import { Internacional } from 'src/schemas/languagesWrapperSchema';
import schema from 'src/schemas';
import HttpRequestErrors from 'src/support/helpers/HttpRequestErrors';

describe('Services :: DungeonsAndDragons5e :: SpellsServices', () => {
    const DM_MOCK = new DatabaseManagement();

    const ValidateDataMock = new ValidateData();

    const SpellsModelMock = DM_MOCK.modelInstance('dungeons&dragons5e', 'Spells');
    const SpellsServicesMock = new SpellsServices(
        SpellsModelMock,
        logger,
        ValidateDataMock,
        schema['dungeons&dragons5e']
    );

    const spellMockInstance = mocks.spell.instance as Internacional<Spell>;
    const { _id: _, ...spellMockPayload } = spellMockInstance;

    describe('When the recover all enabled spells service is called', () => {
        beforeAll(() => {
            jest.spyOn(SpellsModelMock, 'findAll').mockResolvedValue([spellMockInstance]);
        });

        it('should return correct data', async () => {
            const responseTest = await SpellsServicesMock.findAll();
            expect(responseTest).toStrictEqual([spellMockInstance]);
        });
    });

    describe('When the recover all disabled spells service is called', () => {
        const spellMockDisabled = { active: false, ...spellMockInstance };

        beforeAll(() => {
            jest.spyOn(SpellsModelMock, 'findAll').mockResolvedValue([spellMockDisabled]);
        });

        it('should return correct data', async () => {
            const responseTest = await SpellsServicesMock.findAllDisabled();
            expect(responseTest).toStrictEqual([spellMockDisabled]);
        });
    });

    describe('When the recover a spell by ID service is called', () => {
        beforeAll(() => {
            jest.spyOn(SpellsModelMock, 'findOne').mockResolvedValueOnce(spellMockInstance).mockResolvedValue(null);
        });

        it('should return correct data when ID valid', async () => {
            const responseTest = await SpellsServicesMock.findOne(spellMockInstance._id as string);
            expect(responseTest).toBe(spellMockInstance);
        });

        it('should throw an error when ID is inexistent', async () => {
            try {
                await SpellsServicesMock.findOne('inexistent_id');
            } catch (error) {
                const err = error as HttpRequestErrors;
                expect(err.message).toBe('NotFound an object with provided ID');
                expect(err.code).toBe(404);
                expect(err.name).toBe('NotFound');
            }
        });
    });

    describe('When service for update a spell is called', () => {
        const spellMockID = spellMockInstance._id as string;
        const spellMockUpdateInstance = {
            en: { ...spellMockInstance.en, name: 'None' },
            pt: { ...spellMockInstance.pt, name: 'None' },
        };
        const spellMockPayloadWithoutActive = { ...spellMockPayload };
        delete spellMockPayloadWithoutActive.active;

        const { name: _1, ...spellsMockEnWithoutName } = spellMockPayload.en;
        const { name: _2, ...spellsMockPtWithoutName } = spellMockPayload.pt;
        const spellMockPayloadWrong = {
            en: spellsMockEnWithoutName,
            pt: spellsMockPtWithoutName,
        };

        beforeAll(() => {
            jest.spyOn(SpellsModelMock, 'update')
                .mockResolvedValueOnce(spellMockUpdateInstance)
                .mockResolvedValue(null);
        });

        it('should return correct data with updated values', async () => {
            const responseTest = await SpellsServicesMock.update(
                spellMockID,
                spellMockPayloadWithoutActive as Internacional<Spell>
            );
            expect(responseTest).toBe(spellMockUpdateInstance);
        });

        it('should throw an error when payload is incorrect', async () => {
            try {
                await SpellsServicesMock.update(spellMockID, spellMockPayloadWrong as Internacional<Spell>);
            } catch (error) {
                const err = error as HttpRequestErrors;
                expect(err.details).toHaveLength(2);
                expect(err.details[0].attribute[0]).toBe('en');
                expect(err.details[0].attribute[1]).toBe('name');
                expect(err.details[0].reason).toBe('Required');
                expect(err.code).toBe(422);
                expect(err.name).toBe('ValidationError');
            }
        });

        it('should throw an error when try to update availability', async () => {
            try {
                await SpellsServicesMock.update('inexistent_id', spellMockPayload as Internacional<Spell>);
            } catch (error) {
                const err = error as HttpRequestErrors;
                expect(err.message).toBe('Not possible to change availability through this route');
                expect(err.code).toBe(400);
                expect(err.name).toBe('BadRequest');
            }
        });

        it('should throw an error when ID is inexistent', async () => {
            try {
                await SpellsServicesMock.update('inexistent_id', spellMockPayloadWithoutActive as Internacional<Spell>);
            } catch (error) {
                const err = error as HttpRequestErrors;
                expect(err.message).toBe('NotFound an object with provided ID');
                expect(err.code).toBe(404);
                expect(err.name).toBe('NotFound');
            }
        });
    });

    describe('When service for update availability spell is called', () => {
        const spellMockID = spellMockInstance._id as string;
        const spellMockUpdateInstance = {
            _id: spellMockID,
            active: false,
            en: { ...spellMockInstance.en },
            pt: { ...spellMockInstance.pt },
        };

        const spellMockFindInstance = {
            _id: spellMockID,
            active: true,
            en: { ...spellMockInstance.en },
            pt: { ...spellMockInstance.pt },
        };

        const responseMessageMockActivated = {
            message: `Spell ${spellMockID} was activated`,
            name: 'success',
        };

        const responseMessageMockDeactivated = {
            message: `Spell ${spellMockID} was deactivated`,
            name: 'success',
        };

        beforeAll(() => {
            jest.spyOn(SpellsModelMock, 'findOne')
                .mockResolvedValueOnce(spellMockFindInstance)
                .mockResolvedValueOnce({ ...spellMockFindInstance, active: false })
                .mockResolvedValueOnce({ ...spellMockFindInstance, active: true })
                .mockResolvedValueOnce(spellMockUpdateInstance)
                .mockResolvedValue(null);

            jest.spyOn(SpellsModelMock, 'update')
                .mockResolvedValueOnce(spellMockUpdateInstance)
                .mockResolvedValueOnce(spellMockUpdateInstance)
                .mockResolvedValue(null);
        });

        it('should return correct success message - disable', async () => {
            const responseTest = await SpellsServicesMock.updateAvailability(spellMockID, false);
            expect(responseTest).toStrictEqual(responseMessageMockDeactivated);
        });

        it('should return correct success message - enable', async () => {
            const responseTest = await SpellsServicesMock.updateAvailability(spellMockID, true);
            expect(responseTest).toStrictEqual(responseMessageMockActivated);
        });

        it('should throw an error when the spell is already enabled', async () => {
            try {
                await SpellsServicesMock.updateAvailability(spellMockID, true);
            } catch (error) {
                const err = error as HttpRequestErrors;
                expect(err.message).toBe('Not possible to change availability through this route');
                expect(err.code).toBe(400);
                expect(err.name).toBe('BadRequest');
            }
        });

        it('should throw an error when the spell is already disabled', async () => {
            try {
                await SpellsServicesMock.updateAvailability(spellMockID, false);
            } catch (error) {
                const err = error as HttpRequestErrors;
                expect(err.message).toBe('Not possible to change availability through this route');
                expect(err.code).toBe(400);
                expect(err.name).toBe('BadRequest');
            }
        });

        it('should throw an error when ID is inexistent', async () => {
            try {
                await SpellsServicesMock.updateAvailability('inexistent_id', false);
            } catch (error) {
                const err = error as HttpRequestErrors;
                expect(err.message).toBe('NotFound an object with provided ID');
                expect(err.code).toBe(404);
                expect(err.name).toBe('NotFound');
            }
        });
    });
});
