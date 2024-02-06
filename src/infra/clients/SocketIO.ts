import socket from 'socket.io';
import { Server } from 'http';
import {
    SocketRooms,
    Coordinates,
    SquareSize,
} from 'src/types/modules/infra/connection/SocketIO';
import InfraDependencies from 'src/types/modules/infra/InfraDependencies';
import newUUID from 'src/domains/common/helpers/newUUID';

/*
    Funcionalidade finalizada, falta apenas uma melhor nomenclatura para se adequar ao projeto e ajustes finos
    com o mesmo propósito.
*/

export default class SocketIO {
    private _io = {} as socket.Server;
    private readonly _rooms: SocketRooms = {};
    private readonly _logger;

    constructor({ logger }: InfraDependencies['socketIOContract']) {
        this._logger = logger;

        this.connect = this.connect.bind(this);
        this._joinRoomSocketEvent = this._joinRoomSocketEvent.bind(this);
        this._createBox = this._createBox.bind(this);
        this._changeBackgroundSocketEvent = this._changeBackgroundSocketEvent.bind(this);
        this._uploadImageSocketEvent = this._uploadImageSocketEvent.bind(this);
        this._disconnectSocketEvent = this._disconnectSocketEvent.bind(this);
        this._deleteSocketEvent = this._deleteSocketEvent.bind(this);
        this._moveSocketEvent = this._moveSocketEvent.bind(this);
        this._resizeSocketEvent = this._resizeSocketEvent.bind(this);
    }

    public async connect(httpServer: Server): Promise<void> {
        this._logger('info', 'Connect - SocketIO', true);

        this._io = new socket.Server(httpServer, {
            cors: {
                origin: '*',
                allowedHeaders: ['access_key'],
            },
        });

        this._io.on('connection', (socket) => {
            socket.on('join', async (roomId: string = newUUID()) => {
                await this._joinRoomSocketEvent(roomId, socket);
            });
            socket.on('create-box', this._createBox);
            socket.on('change-background', this._changeBackgroundSocketEvent);
            socket.on('move-box', this._moveSocketEvent);
            socket.on('delete-box', this._deleteSocketEvent);
            socket.on('set-avatar-image', this._uploadImageSocketEvent);
            socket.on('resize-box', this._resizeSocketEvent);
            socket.on('disconnect-socket', this._disconnectSocketEvent);
        });
    }

    private async _joinRoomSocketEvent(
        roomId: string = newUUID(),
        socket: socket.Socket
    ): Promise<void> {
        await socket.join(roomId);
        const roomData = this._rooms[roomId] || {
            objects: [],
            images: [],
            background: '',
            roomId,
        };

        this._rooms[roomId] = roomData;

        socket.emit('Joined a room', this._rooms[roomId]);
    }

    private _changeBackgroundSocketEvent(roomId: string, imageLink: string): void {
        this._rooms[roomId].background = imageLink;
        this._io
            .to(roomId)
            .emit('Background Changed', imageLink);
    }

    private _createBox(roomId: string, avatarName: string, userId: string): void {
        const avatarData = {
            avatarName,
            position: { x: 0, y: 0 },
            size: { width: 200, height: 200 },
            userId,
        };

        this._rooms[roomId].objects.push(avatarData);

        this._io.to(roomId).emit('Created a box', avatarData);
    }

    private _moveSocketEvent(
        roomId: string,
        avatarName: string,
        coordinate: Coordinates,
        socketId: string
    ): void {
        const avatarIndex = this._rooms[roomId].objects.findIndex(
            (avatar) => avatar.avatarName === avatarName
        );

        this._rooms[roomId].objects[avatarIndex].position.x = coordinate.x;
        this._rooms[roomId].objects[avatarIndex].position.y = coordinate.y;

        this._io.to(roomId).except(socketId).emit('Avatar Moved', coordinate.x, coordinate.y, avatarName);
    }

    private _deleteSocketEvent(roomId: string, avatarName: string): void {
        const avatars = this._rooms[roomId].objects.filter(
            (box: any) => box.avatarName !== avatarName
        );
        this._rooms[roomId].objects = avatars;
        this._io.to(roomId).emit('Box Deleted', avatarName);
    }

    private _uploadImageSocketEvent(
        roomId: string,
        avatarName: string,
        imageLink: string
    ): void {
        const avatarIndex = this._rooms[roomId].objects.findIndex(
            (avatar) => avatar.avatarName === avatarName
        );

        this._rooms[roomId].objects[avatarIndex].picture = imageLink;
        this._io
            .to(roomId)
            .emit('Avatar Picture Uploaded', avatarName, imageLink);
    }

    private _resizeSocketEvent(
        roomId: string,
        avatarName: string,
        size: SquareSize,
        socketId: string
    ): void {
        const avatarIndex = this._rooms[roomId].objects.findIndex(
            (avatar) => avatar.avatarName === avatarName
        );

        this._rooms[roomId].objects[avatarIndex].size.width = size.width;
        this._rooms[roomId].objects[avatarIndex].size.height = size.height;

        this._io.to(roomId).except(socketId).emit('Box Resized', size, avatarName);
    }

    private _disconnectSocketEvent(): void {
        this._logger('info', 'User disconnected', true);
    }
}
