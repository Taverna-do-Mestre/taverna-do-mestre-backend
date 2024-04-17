import { Response, Request } from 'express';
import { HttpStatusCode } from 'src/domains/common/helpers/HttpStatusCode';
import {
    CampaignPayload,
    UpdateMatchMusicsPayload,
    // UpdateMatchDatesPayload,
} from 'src/types/api/campaigns/http/payload';
import { CampaignsControllerContract } from 'src/types/modules/interface/campaigns/presentation/campaigns/CampaignsController.d';
import { UserInstance } from 'src/domains/users/schemas/usersValidationSchema';
import { FileObject } from 'src/types/shared/file';

export default class CampaignsController {
    private readonly _createCampaignOperation;
    private readonly _updateCampaignOperation;
    private readonly _getCampaignByIdOperation;
    private readonly _publishPostOperation;
    private readonly _updateMatchMusicsOperation;
    private readonly _updateMatchMapImagesOperation;
    private readonly _updateMatchDatesOperation;

    constructor({
        getCampaignByIdOperation,
        publishPostOperation,
        createCampaignOperation,
        updateCampaignOperation,
        updateMatchMapImagesOperation,
        updateMatchMusicsOperation,
        updateMatchDatesOperation,
    }: CampaignsControllerContract) {
        this._createCampaignOperation = createCampaignOperation;
        this._updateCampaignOperation = updateCampaignOperation;
        this._getCampaignByIdOperation = getCampaignByIdOperation;
        this._publishPostOperation = publishPostOperation;
        this._updateMatchMapImagesOperation = updateMatchMapImagesOperation;
        this._updateMatchMusicsOperation = updateMatchMusicsOperation;
        this._updateMatchDatesOperation = updateMatchDatesOperation;

        this.create = this.create.bind(this);
        this.getById = this.getById.bind(this);
        this.publishPost = this.publishPost.bind(this);
        this.update = this.update.bind(this);
        this.updateMatchMapImages = this.updateMatchMapImages.bind(this);
        this.updateMatchMusics = this.updateMatchMusics.bind(this);
        this.updateMatchDates = this.updateMatchDates.bind(this);
    }

    public async create(req: Request, res: Response): Promise<Response> {
        const campaign = req.body as CampaignPayload;
        const { userId } = req.user as UserInstance;
        const image = req.file as FileObject;
        const result = await this._createCampaignOperation.execute({
            campaign,
            userId,
            image,
        });
        return res.status(HttpStatusCode.CREATED).json(result);
    }

    public async getById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        const result = await this._getCampaignByIdOperation.execute({ campaignId: id });
        return res.status(HttpStatusCode.OK).json(result);
    }

    public async publishPost(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { userId } = req.query as { userId: string };
        const payload = req.body;

        const result = await this._publishPostOperation.execute({ campaignId: id, userId, payload });
        return res.status(HttpStatusCode.CREATED).json(result);
    }

    public async updateMatchMapImages(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { imageId, operation } = req.query as {
            imageId?: string;
            operation: 'add' | 'remove';
        };

        const mapImage = req.file as FileObject;

        const result = await this._updateMatchMapImagesOperation.execute({
            campaignId: id,
            imageId,
            operation,
            mapImage,
        });

        return res.status(HttpStatusCode.OK).json(result);
    }

    public async updateMatchMusics(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { operation } = req.query as { operation: 'add' | 'remove' };
        const { title, youtubeLink } = req.body as UpdateMatchMusicsPayload;

        const result = await this._updateMatchMusicsOperation.execute({
            campaignId: id,
            title,
            operation,
            youtubeLink,
        });

        return res.status(HttpStatusCode.OK).json(result);
    }

    public async updateMatchDates(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { operation, date } = req.query as {
            operation: 'add' | 'remove';
            date: string;
        };

        const result = await this._updateMatchDatesOperation.execute({
            campaignId: id,
            date,
            operation,
        });

        return res.status(HttpStatusCode.OK).json(result);
    }

    public async update(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const payload = req.body;
        const cover = req.file;

        const result = await this._updateCampaignOperation.execute({
            ...payload,
            cover,
            campaignId: id,
        });

        return res.status(HttpStatusCode.OK).json(result);
    }
}
