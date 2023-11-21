import { Wiki } from 'src/domains/dungeons&dragons5e/DungeonsAndDragons5EInterfaces';
import { Internacional } from 'src/domains/dungeons&dragons5e/LanguagesWrapper';
import { ToggleWikisAvailabilityServiceContract } from 'src/types/dungeons&dragons5e/contracts/core/wikis/ToggleWikisAvailability';
import { AvailabilityPayload } from 'src/types/dungeons&dragons5e/requests/Payload';

export default class ToggleWikisAvailabilityService {
    private readonly _dungeonsAndDragonsRepository;
    private readonly _logger;

    constructor({
        dungeonsAndDragonsRepository,
        logger,
    }: ToggleWikisAvailabilityServiceContract) {
        this._dungeonsAndDragonsRepository = dungeonsAndDragonsRepository;
        this._logger = logger;

        this.toggle = this.toggle.bind(this);
    }

    public async toggle({
        id,
        availability,
    }: AvailabilityPayload): Promise<Internacional<Wiki>> {
        this._logger('info', 'Toggle - ToggleWikisAvailabilityService');
        this._dungeonsAndDragonsRepository.setEntity('Wikis');

        const wikiInDb = (await this._dungeonsAndDragonsRepository.findOne({
            wikiId: id,
        })) as Internacional<Wiki>;

        wikiInDb.active = availability;

        await this._dungeonsAndDragonsRepository.update({
            query: { wikiId: id },
            payload: wikiInDb,
        });

        return wikiInDb;
    }
}
