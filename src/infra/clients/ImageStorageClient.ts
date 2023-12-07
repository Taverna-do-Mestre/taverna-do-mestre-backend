import { AxiosResponse } from 'axios';
import { FileObject } from 'src/types/File';
import { ImageStorageClientContract } from 'src/types/clients/ImageStorageClient';

export default class ImageStorageClient {
    private readonly _logger;
    private readonly _configs;
    private readonly _httpRequest;

    constructor({ logger, configs, httpRequest }: ImageStorageClientContract) {
        this._logger = logger;
        this._configs = configs;
        this._httpRequest = httpRequest;
    }

    async upload(image: FileObject): Promise<AxiosResponse> {
        this._logger('info', 'Upload - ImageStorageClient');
        const { baseUrl, authorization, endpoints } = this._configs.api.imgur;

        const url = baseUrl + endpoints.postImage;

        const imageUploaded = process.env.NODE_ENV === 'production' ? await this._httpRequest({
            method: 'post',
            url,
            data: Buffer.from(image.buffer, 'base64'),
            headers: {
                'Content-Type': 'text/plain',
                Authorization: authorization,
            },
        }) : {data: {
            data: {
                id: '',
                link: ''
            }
        }};

        return imageUploaded.data;
    }
}
