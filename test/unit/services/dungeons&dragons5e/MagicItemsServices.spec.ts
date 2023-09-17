import DatabaseManagement, { DnDMagicItem, Internacional, SchemasDnDType } from '@tablerise/database-management';
import MagicItemsServices from 'src/services/dungeons&dragons5e/MagicItemsServices';
import mocks from 'src/support/mocks/dungeons&dragons5e';
import ValidateData from 'src/support/helpers/ValidateData';

import logger from '@tablerise/dynamic-logger';

describe('Services :: DungeonsAndDragons5e :: MagicItemsServices', () => {
    const DM_MOCK = new DatabaseManagement();

    const ValidateDataMock = new ValidateData(logger);

    const MagicItemsModelMock = DM_MOCK.modelInstance('dungeons&dragons5e', 'MagicItems');
    const MagicItemsSchemaMock = DM_MOCK.schemaInstance('dungeons&dragons5e') as SchemasDnDType;
    const MagicItemsServicesMock = new MagicItemsServices(
        MagicItemsModelMock,
        logger,
        ValidateDataMock,
        MagicItemsSchemaMock
    );

    const magicItemMockInstance = mocks.magicItems.instance as Internacional<DnDMagicItem>;
    const { _id: _, ...magicItemMockPayload } = magicItemMockInstance;

    describe('When the recover all magic items service is called', () => {
        beforeAll(() => {
            jest.spyOn(MagicItemsModelMock, 'findAll').mockResolvedValue([magicItemMockInstance]);
        });

        it('should return correct data', async () => {
            const responseTest = await MagicItemsServicesMock.findAll();
            expect(responseTest).toStrictEqual([magicItemMockInstance]);
        });
    });

    describe('When the recover all disabled magicItems service is called', () => {
        const magicItemMockDisabled = { ...magicItemMockInstance, active: false };

        beforeAll(() => {
            jest.spyOn(MagicItemsModelMock, 'findAll').mockResolvedValue([magicItemMockDisabled]);
        });

        it('should return correct data', async () => {
            const responseTest = await MagicItemsServicesMock.findAllDisabled();
            expect(responseTest).toStrictEqual([magicItemMockDisabled]);
        });
    });

    describe('When the recover a magic item by ID service is called', () => {
        beforeAll(() => {
            jest.spyOn(MagicItemsModelMock, 'findOne')
                .mockResolvedValueOnce(magicItemMockInstance)
                .mockResolvedValue(null);
        });

        it('should return correct data when ID valid', async () => {
            const responseTest = await MagicItemsServicesMock.findOne(magicItemMockInstance._id as string);
            expect(responseTest).toBe(magicItemMockInstance);
        });

        it('should throw an error when ID is inexistent', async () => {
            try {
                await MagicItemsServicesMock.findOne('inexistent_id');
            } catch (error) {
                const err = error as Error;
                expect(err.message).toBe('NotFound an object with provided ID');
                expect(err.stack).toBe('404');
                expect(err.name).toBe('NotFound');
            }
        });
    });

    describe('When service for update a magic item is called', () => {
        const magicItemMockID = magicItemMockInstance._id as string;
        const magicItemMockUpdateInstance = {
            en: { ...magicItemMockInstance.en, name: 'None' },
            pt: { ...magicItemMockInstance.pt, name: 'None' },
        };

        const magicItemMockPayloadWithoutActive = { ...magicItemMockPayload };
        delete magicItemMockPayloadWithoutActive.active;

        const { name: _1, ...magicItemMockEnWithoutName } = magicItemMockPayload.en;
        const { name: _2, ...magicItemMockPtWithoutName } = magicItemMockPayload.pt;
        const magicItemMockPayloadWrong = {
            en: magicItemMockEnWithoutName,
            pt: magicItemMockPtWithoutName,
        };

        beforeAll(() => {
            jest.spyOn(MagicItemsModelMock, 'update')
                .mockResolvedValueOnce(magicItemMockUpdateInstance)
                .mockResolvedValue(null);
        });

        it('should return correct data with updated values', async () => {
            const responseTest = await MagicItemsServicesMock.update(
                magicItemMockID,
                magicItemMockPayloadWithoutActive as Internacional<DnDMagicItem>
            );
            expect(responseTest).toBe(magicItemMockUpdateInstance);
        });

        it('should throw an error when payload is incorrect', async () => {
            try {
                await MagicItemsServicesMock.update(
                    magicItemMockID,
                    magicItemMockPayloadWrong as Internacional<DnDMagicItem>
                );
            } catch (error) {
                const err = error as Error;
                expect(JSON.parse(err.message)[0].path).toStrictEqual(['en', 'name']);
                expect(JSON.parse(err.message)[0].message).toBe('Required');
                expect(err.stack).toBe('422');
                expect(err.name).toBe('ValidationError');
            }
        });

        it('should throw an error when try to update availability', async () => {
            try {
                await MagicItemsServicesMock.update(
                    'inexistent_id',
                    magicItemMockPayload as Internacional<DnDMagicItem>
                );
            } catch (error) {
                const err = error as Error;
                expect(err.message).toBe('Not possible to change availability through this route');
                expect(err.stack).toBe('400');
                expect(err.name).toBe('BadRequest');
            }
        });

        it('should throw an error when ID is inexistent', async () => {
            try {
                await MagicItemsServicesMock.update(
                    'inexistent_id',
                    magicItemMockPayloadWithoutActive as Internacional<DnDMagicItem>
                );
            } catch (error) {
                const err = error as Error;
                expect(err.message).toBe('NotFound an object with provided ID');
                expect(err.stack).toBe('404');
                expect(err.name).toBe('NotFound');
            }
        });
    });

    describe('When service for update availability magic item is called', () => {
        const magicItemMockID = magicItemMockInstance._id as string;
        const magicItemMockUpdateInstance = {
            _id: magicItemMockID,
            active: false,
            en: { ...magicItemMockInstance.en },
            pt: { ...magicItemMockInstance.pt },
        };

        const magicItemMockFindInstance = {
            _id: magicItemMockID,
            active: true,
            en: { ...magicItemMockInstance.en },
            pt: { ...magicItemMockInstance.pt },
        };

        const responseMessageMockActivated = {
            message: `Magic Items ${magicItemMockID} was activated`,
            name: 'success',
        };

        const responseMessageMockDeactivated = {
            message: `Magic Items ${magicItemMockID} was deactivated`,
            name: 'success',
        };

        beforeAll(() => {
            jest.spyOn(MagicItemsModelMock, 'findOne')
                .mockResolvedValueOnce(magicItemMockFindInstance)
                .mockResolvedValueOnce({ ...magicItemMockFindInstance, active: false })
                .mockResolvedValueOnce({ ...magicItemMockFindInstance, active: true })
                .mockResolvedValueOnce(magicItemMockUpdateInstance)
                .mockResolvedValue(null);

            jest.spyOn(MagicItemsModelMock, 'update')
                .mockResolvedValueOnce(magicItemMockUpdateInstance)
                .mockResolvedValueOnce({ ...magicItemMockUpdateInstance, active: true })
                .mockResolvedValue(null);
        });

        it('should return correct success message - disable', async () => {
            const responseTest = await MagicItemsServicesMock.updateAvailability(magicItemMockID, false);
            expect(responseTest).toStrictEqual(responseMessageMockDeactivated);
        });

        it('should return correct success message - enable', async () => {
            const responseTest = await MagicItemsServicesMock.updateAvailability(magicItemMockID, true);
            expect(responseTest).toStrictEqual(responseMessageMockActivated);
        });

        it('should throw an error when the magic item is already enabled', async () => {
            try {
                await MagicItemsServicesMock.updateAvailability(magicItemMockID, true);
            } catch (error) {
                const err = error as Error;
                expect(err.message).toBe('Not possible to change availability through this route');
                expect(err.stack).toBe('400');
                expect(err.name).toBe('BadRequest');
            }
        });

        it('should throw an error when the background is already disabled', async () => {
            try {
                await MagicItemsServicesMock.updateAvailability(magicItemMockID, false);
            } catch (error) {
                const err = error as Error;
                expect(err.message).toBe('Not possible to change availability through this route');
                expect(err.stack).toBe('400');
                expect(err.name).toBe('BadRequest');
            }
        });

        it('should throw an error when ID is inexistent', async () => {
            try {
                await MagicItemsServicesMock.updateAvailability('inexistent_id', false);
            } catch (error) {
                const err = error as Error;
                expect(err.message).toBe('NotFound an object with provided ID');
                expect(err.stack).toBe('404');
                expect(err.name).toBe('NotFound');
            }
        });
    });
});
