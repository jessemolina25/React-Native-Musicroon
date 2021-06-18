import Database from '@ioc:Adonis/Lucid/Database';
import ServerToTemporalController from 'App/Controllers/Http/Temporal/ServerToTemporalController';
import Device from 'App/Models/Device';
import Room from 'App/Models/Room';
import { datatype, random } from 'faker';
import test from 'japa';
import sinon from 'sinon';
import { io, Socket } from 'socket.io-client';
import {
    AllClientToServerEvents,
    AllServerToClientEvents,
} from '../../types/dist';

const BASE_URL = `http://${process.env.HOST!}:${process.env.PORT!}`;

function waitForTimeout(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

const sleep = async (): Promise<void> => await waitForTimeout(100);

type TypedSocket = Socket<AllServerToClientEvents, AllClientToServerEvents>;

let socketsConnections: TypedSocket[] = [];

async function getSocket(userID: string): Promise<TypedSocket> {
    const socket = io(BASE_URL, {
        query: {
            userID,
        },
    });
    socketsConnections.push(socket);
    await sleep();
    return socket;
}

async function disconnectSocket(socket: TypedSocket): Promise<void> {
    socket.disconnect();
    socketsConnections = socketsConnections.filter((el) => el.id !== socket.id);
    await sleep();
}

/**
 * User should create a room, and removes it after user disconnection
 * User should join a room
 * It should create device after user's socket connection, and removes it from base after disconnection
 * It should sent FORCED_DISCONNECTION to all users in room
 *
 *
 */

test.group('Rooms life cycle', (group) => {
    group.beforeEach(async () => {
        await Database.beginGlobalTransaction();
        socketsConnections = [];
    });

    group.afterEach(async () => {
        sinon.restore();
        await Database.rollbackGlobalTransaction();
        socketsConnections.forEach((socket) => {
            socket.disconnect();
        });
    });

    test('On user socket connection, it should register his device in db, on disconnection removes it from db', async (assert) => {
        const userID = datatype.uuid();
        const socket = await getSocket(userID);

        /**
         * Check if only 1 device for given userID is well registered in database
         * Verify if socket.id matches
         */
        const device = await Device.query().where('user_id', userID);
        console.log(device.length);
        assert.equal(device.length, 1);
        assert.equal(device[0].socketID, socket.id);
        await disconnectSocket(socket);

        /**
         * After disconnection the device should be remove from database
         */
        assert.equal((await Device.query().where('user_id', userID)).length, 0);
    });

    test('User creates a room, on user disconnection, it should removes the room from database', async (assert) => {
        const userID = datatype.uuid();
        const socket = await getSocket(userID);
        const name = random.words(1);

        /** Mocks */
        sinon
            .stub(ServerToTemporalController, 'terminateWorkflow')
            .callsFake(async (): Promise<void> => {
                return;
            });
        sinon
            .stub(ServerToTemporalController, 'createWorflow')
            .callsFake(async () => {
                return {
                    runID: datatype.uuid(),
                    workflowID: datatype.uuid(),
                    state: {
                        playing: false,
                        name,
                        users: [userID],
                    },
                };
            });
        /** ***** */

        /**
         * Emit CREATE_ROOM
         * Expecting it to be in database
         */
        socket.emit('CREATE_ROOM', { name, userID }, () => {
            return;
        });
        await sleep();
        const roomBefore = await Room.findBy('creator', userID);
        assert.isNotNull(roomBefore);

        /**
         * Emit disconnect
         * Expecting room to be removed from database
         */
        await disconnectSocket(socket);
        const roomAfter = await Room.findBy('creator', userID);
        assert.isNull(roomAfter);
    });

    test('When a room got evicted, users in it should receive a FORCED_DISCONNECTION socket event', async (assert) => {
        const userIDS = Array.from({ length: 2 }, () => datatype.uuid());
        console.log(userIDS);
        const userA = {
            userID: userIDS[0],
            socket: await getSocket(userIDS[0]),
        };
        const userB = {
            userID: userIDS[1],
            socket: await getSocket(userIDS[1]),
            receivedEvents: [] as string[],
        };
        userB.socket.once('FORCED_DISCONNECTION', () => {
            userB.receivedEvents.push('FORCED_DISCONNECTION');
        });
        const name = random.word();

        /** Mocks */
        sinon
            .stub(ServerToTemporalController, 'terminateWorkflow')
            .callsFake(async () => {
                return;
            });
        sinon
            .stub(ServerToTemporalController, 'createWorflow')
            .callsFake(async () => {
                return {
                    runID: datatype.uuid(),
                    workflowID: datatype.uuid(),
                    state: {
                        playing: false,
                        name,
                        users: [userA.userID],
                    },
                };
            });
        sinon
            .stub(ServerToTemporalController, 'joinWorkflow')
            .callsFake(async () => {
                return;
            });
        /** ***** */

        /**
         * Check if both users devices are in db
         * UserA creates room
         */
        assert.isNotNull(await Device.findBy('user_id', userA.userID));
        assert.isNotNull(await Device.findBy('user_id', userB.userID));
        userA.socket.emit('CREATE_ROOM', { name, userID: userA.userID }, () => {
            return;
        });
        await sleep();

        /**
         * Check if room is in db
         * UserB joins the room
         */
        const room = await Room.findBy('creator', userA.userID);
        assert.isNotNull(room);
        if (!room) throw new Error('room is undefined');
        userB.socket.emit('JOIN_ROOM', {
            roomID: room.uuid,
            userID: userB.userID,
        });
        await sleep();

        /**
         * UserA emits disconnect
         */
        await disconnectSocket(userA.socket);

        /**
         * Check if room isn't in db
         * If UserB received FORCED_DISCONNECTION websocket event
         * If UserB device is in db
         */
        assert.isNull(await Room.findBy('creator', userA.userID));
        assert.equal(userB.receivedEvents[0], 'FORCED_DISCONNECTION');
        assert.isNotNull(await Device.findBy('user_id', userB.userID));
    });
    test('It should not remove room from database, as creator has more than one device/session alive', async (assert) => {
        const userID = datatype.uuid();
        const user = {
            socketA: await getSocket(userID),
            socketB: await getSocket(userID),
        };
        await Room.create({
            uuid: datatype.uuid(),
            runID: datatype.uuid(),
            creator: userID,
        });

        /** Mocks */
        sinon
            .stub(ServerToTemporalController, 'terminateWorkflow')
            .callsFake(async () => {
                return;
            });
        /** ***** */

        /**
         *  Check if both user's devices are in database
         *  Then emit disconnect from one device
         */
        assert.equal((await Device.query().where('user_id', userID)).length, 2);
        await disconnectSocket(user.socketA);

        /**
         * Check if room is still in database
         * Then emit disconnect from last device
         */
        assert.isNotNull(await Room.findBy('creator', userID));
        await disconnectSocket(user.socketB);

        /**
         * Check if room is not in database
         */
        assert.isNull(await Room.findBy('creator', userID));
    });
});
