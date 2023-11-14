import { Monster } from 'src/domains/dungeons&dragons5e/DungeonsAndDragons5EInterfaces';
import { Internacional } from 'src/domains/dungeons&dragons5e/LanguagesWrapper';
import { GetDisabledMonstersServiceContract } from 'src/types/dungeons&dragons5e/contracts/core/monsters/GetDisabledMonsters';

export default class GetDisabledMonstersService {
    private readonly _dungeonsAndDragonsRepository;
    private readonly _logger;

    constructor({
        dungeonsAndDragonsRepository,
        logger,
    }: GetDisabledMonstersServiceContract) {
        this._dungeonsAndDragonsRepository = dungeonsAndDragonsRepository;
        this._logger = logger;

        this.getAllDisabled = this.getAllDisabled.bind(this);
    }

    public async getAllDisabled(): Promise<Array<Internacional<Monster>>> {
        this._logger('info', 'GetAll - GetDisabledMonstersService');
        this._dungeonsAndDragonsRepository.setEntity('Monsters');

        const monsterInDb = (await this._dungeonsAndDragonsRepository.find({
            active: false,
        })) as Array<Internacional<Monster>>;
        return monsterInDb;
    }
}
