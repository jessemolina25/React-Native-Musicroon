import Database from '@ioc:Adonis/Lucid/Database';
import { datatype, random, lorem } from 'faker';
import test from 'japa';
import { initTestUtils, waitForTimeout } from './utils/TestUtils';

test.group('MtvRoom Chat', (group) => {
    const {
        createAuthenticatedUserAndGetSocket,
        disconnectEveryRemainingSocketConnection,
        initSocketConnection,
        waitFor,
    } = initTestUtils();

    group.beforeEach(async () => {
        initSocketConnection();
        await Database.beginGlobalTransaction();
    });

    group.afterEach(async () => {
        await disconnectEveryRemainingSocketConnection();
        await Database.rollbackGlobalTransaction();
    });

    test('Sent message is received by users in room', async (assert) => {
        const senderUserID = datatype.uuid();
        const receiverUserID = datatype.uuid();
        const mtvRoomID = datatype.uuid();

        const senderSocket = await createAuthenticatedUserAndGetSocket({
            userID: senderUserID,
            mtvRoomIDToAssociate: mtvRoomID,
        });
        const receiverSocket = await createAuthenticatedUserAndGetSocket({
            userID: receiverUserID,
            mtvRoomIDToAssociate: mtvRoomID,
        });

        let messageHasBeenReceivedByReceiver = false;

        receiverSocket.on('MTV_RECEIVED_MESSAGE', () => {
            messageHasBeenReceivedByReceiver = true;
        });

        senderSocket.emit('MTV_NEW_MESSAGE', {
            message: random.words(),
        });

        await waitFor(() => {
            assert.isTrue(messageHasBeenReceivedByReceiver);
        });
    });

    test('Messages are trimmed', async (assert) => {
        const senderUserID = datatype.uuid();
        const receiverUserID = datatype.uuid();
        const mtvRoomID = datatype.uuid();

        const senderSocket = await createAuthenticatedUserAndGetSocket({
            userID: senderUserID,
            mtvRoomIDToAssociate: mtvRoomID,
        });
        const receiverSocket = await createAuthenticatedUserAndGetSocket({
            userID: receiverUserID,
            mtvRoomIDToAssociate: mtvRoomID,
        });

        let messageReceivedByReceiver: string | undefined;
        receiverSocket.on('MTV_RECEIVED_MESSAGE', ({ message: { text } }) => {
            messageReceivedByReceiver = text;
        });

        const messageToSend = random.words();
        senderSocket.emit('MTV_NEW_MESSAGE', {
            message: `  ${messageToSend}  `,
        });

        await waitFor(() => {
            assert.equal(messageReceivedByReceiver, messageToSend);
        });
    });

    test('Sent message is not received by sender', async (assert) => {
        const senderUserID = datatype.uuid();
        const mtvRoomID = datatype.uuid();

        const senderSocket = await createAuthenticatedUserAndGetSocket({
            userID: senderUserID,
            mtvRoomIDToAssociate: mtvRoomID,
        });

        let messageHasBeenReceivedByEmitter = false;

        senderSocket.on('MTV_RECEIVED_MESSAGE', () => {
            messageHasBeenReceivedByEmitter = true;
        });

        senderSocket.emit('MTV_NEW_MESSAGE', {
            message: random.words(),
        });

        await waitForTimeout(200);

        assert.isFalse(messageHasBeenReceivedByEmitter);
    });

    test('Sent message is not received by users not in room', async (assert) => {
        const senderUserID = datatype.uuid();
        const otherUserID = datatype.uuid();
        const mtvRoomID = datatype.uuid();

        const senderSocket = await createAuthenticatedUserAndGetSocket({
            userID: senderUserID,
            mtvRoomIDToAssociate: mtvRoomID,
        });
        const otherUserSocket = await createAuthenticatedUserAndGetSocket({
            userID: otherUserID,
        });

        let messageHasBeenReceivedByOtherUser = false;

        otherUserSocket.on('MTV_RECEIVED_MESSAGE', () => {
            messageHasBeenReceivedByOtherUser = true;
        });

        senderSocket.emit('MTV_NEW_MESSAGE', {
            message: random.words(),
        });

        await waitForTimeout(200);

        assert.isFalse(messageHasBeenReceivedByOtherUser);
    });

    test('Empty messages are discarded', async (assert) => {
        const senderUserID = datatype.uuid();
        const receiverUserID = datatype.uuid();
        const mtvRoomID = datatype.uuid();

        const senderSocket = await createAuthenticatedUserAndGetSocket({
            userID: senderUserID,
            mtvRoomIDToAssociate: mtvRoomID,
        });
        const receiverSocket = await createAuthenticatedUserAndGetSocket({
            userID: receiverUserID,
            mtvRoomIDToAssociate: mtvRoomID,
        });

        let messageHasBeenReceivedByReceiver = false;

        receiverSocket.on('MTV_RECEIVED_MESSAGE', () => {
            messageHasBeenReceivedByReceiver = true;
        });

        senderSocket.emit('MTV_NEW_MESSAGE', {
            message: '',
        });

        await waitForTimeout(200);

        assert.isFalse(messageHasBeenReceivedByReceiver);
    });

    test('Too long messages are discarded', async (assert) => {
        const senderUserID = datatype.uuid();
        const receiverUserID = datatype.uuid();
        const mtvRoomID = datatype.uuid();

        const senderSocket = await createAuthenticatedUserAndGetSocket({
            userID: senderUserID,
            mtvRoomIDToAssociate: mtvRoomID,
        });
        const receiverSocket = await createAuthenticatedUserAndGetSocket({
            userID: receiverUserID,
            mtvRoomIDToAssociate: mtvRoomID,
        });

        let messageHasBeenReceivedByReceiver = false;

        receiverSocket.on('MTV_RECEIVED_MESSAGE', () => {
            messageHasBeenReceivedByReceiver = true;
        });

        senderSocket.emit('MTV_NEW_MESSAGE', {
            message: lorem.paragraphs(10),
        });

        await waitForTimeout(200);

        assert.isFalse(messageHasBeenReceivedByReceiver);
    });
});
