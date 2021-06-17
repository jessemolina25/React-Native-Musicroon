import ChatController from 'App/Controllers/Ws/ChatController';
import MtvRoomsWsController from 'App/Controllers/Ws/MtvRoomsWsController';
import Device from 'App/Models/Device';
import Room from 'App/Models/Room';
import Ws from 'App/Services/Ws';

Ws.boot();

//TODO SECURE ROOM CALL
// const roomAuth = (socketID: string, roomID: string | undefined) => {
//     if (!roomID) {
//         console.error('ROOMID REQUIRED 404');
//         return false;
//     }
//     if (!Ws.io.sockets.adapter.rooms[roomID].sockets[socketID]) {
//         console.error('UNAUTH 403');
//         return false;
//     }
//     return true;
// };

Ws.io.on('connection', async (socket) => {
    try {
        ChatController.onConnect({ socket, payload: undefined });

        const userID = socket.handshake.query['userID'];
        console.log({ userID });

        if (!(await Device.findBy('socket_id', socket.id))) {
            console.log(`registering a device for user ${userID}`);
            if (!userID || typeof userID !== 'string') {
                throw new Error('Empty or invalid user token');
            }
            const userAgent = socket.request.headers['user-agent'];
            Device.create({
                socketID: socket.id,
                userID,
                userAgent,
            });
        } else {
            console.log('socketID already registered');
        }

        /// CHAT ///
        socket.on('NEW_MESSAGE', (payload) => {
            ChatController.onWriteMessage({ socket, payload });
        });
        /// //// ///

        /// ROOM ///
        socket.on('CREATE_ROOM', async (payload, callback) => {
            try {
                const { workflowID, state } =
                    await MtvRoomsWsController.onCreate({
                        socket,
                        payload,
                    });
                callback(workflowID, state.name);
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('JOIN_ROOM', async (payload) => {
            try {
                await MtvRoomsWsController.onJoin({ socket, payload });
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('ACTION_PLAY', async (payload) => {
            try {
                //we need to check auth from socket id into a userId into a room users[]
                await MtvRoomsWsController.onPlay({ socket, payload });
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('ACTION_PAUSE', async (payload) => {
            try {
                await MtvRoomsWsController.onPause({ socket, payload });
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('disconnecting', async () => {
            console.log('_'.repeat(10));
            console.log('loosing connection on socket :', socket.id);
            const device = await Device.findBy('socket_id', socket.id);
            if (device) {
                const ownedRooms = await Room.query().where(
                    'creator',
                    device.userID,
                );
                console.log('ownedRooms length ', ownedRooms.length);
                await Promise.all(
                    ownedRooms.map(async (room) => {
                        try {
                            const adapter = Ws.adapter();
                            const connectedSockets = await adapter.sockets(
                                new Set([room.uuid]),
                            );
                            console.log({ connectedSockets });
                            const payload = {
                                roomID: room.uuid,
                            };
                            await MtvRoomsWsController.onTerminate({
                                socket,
                                payload,
                            });
                            Ws.io.in(room.uuid).emit('FORCED_DISCONNECTION');
                            connectedSockets.forEach((socketID) =>
                                adapter.remoteLeave(socketID, room.uuid),
                            );
                            //should use below
                            // console.log(await Ws.adapter().allRooms());
                        } catch (e) {
                            console.error(
                                `error while terminating room: ${room.uuid}`,
                                e,
                            );
                        }
                    }),
                );
            }
            console.log('='.repeat(10));
        });
    } catch (e) {
        console.error(e);
    }

    /// //// ///
});
