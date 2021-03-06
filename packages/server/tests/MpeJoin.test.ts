import Database from '@ioc:Adonis/Lucid/Database';
import { MpeAcknowledgeJoinRequestBody } from '@musicroom/types';
import MpeServerToTemporalController from 'App/Controllers/Http/Temporal/MpeServerToTemporalController';
import { datatype, random } from 'faker';
import test from 'japa';
import sinon from 'sinon';
import supertest from 'supertest';
import urlcat from 'urlcat';
import {
    BASE_URL,
    createSpyOnClientSocketEvent,
    generateMpeWorkflowState,
    getSocketApiAuthToken,
    initTestUtils,
    TEMPORAL_ADONIS_KEY_HEADER,
    TEST_MPE_TEMPORAL_LISTENER,
} from './utils/TestUtils';

test.group(`join mpe room group test`, (group) => {
    const {
        createAuthenticatedUserAndGetSocket,
        disconnectEveryRemainingSocketConnection,
        initSocketConnection,
        createSocketConnection,
        waitFor,
    } = initTestUtils();

    group.beforeEach(async () => {
        initSocketConnection();
        await Database.beginGlobalTransaction();
    });

    group.afterEach(async () => {
        await disconnectEveryRemainingSocketConnection();
        sinon.restore();
        await Database.rollbackGlobalTransaction();
    });

    test('It should fail to hit ack mpe join room as request header is not set', async (assert) => {
        const creatorUserID = datatype.uuid();
        const joiningUserID = datatype.uuid();
        const mpeRoomIDToAssociate = datatype.uuid();
        const state = generateMpeWorkflowState({
            roomID: mpeRoomIDToAssociate,
            roomCreatorUserID: creatorUserID,
        });

        sinon
            .stub(MpeServerToTemporalController, 'joinWorkflow')
            .callsFake(async ({ userID, workflowID, userHasBeenInvited }) => {
                const response: MpeAcknowledgeJoinRequestBody = {
                    joiningUserID: userID,
                    state: {
                        ...state,
                        userRelatedInformation: {
                            userHasBeenInvited: false,
                            userID: joiningUserID,
                        },
                    },
                };

                assert.equal(userID, joiningUserID);
                assert.equal(workflowID, mpeRoomIDToAssociate);
                assert.isFalse(userHasBeenInvited);

                setImmediate(async () => {
                    await supertest(BASE_URL)
                        .post(
                            urlcat(
                                TEST_MPE_TEMPORAL_LISTENER,
                                'acknowledge-join',
                            ),
                        )
                        .send(response)
                        .expect(401);
                });

                return {
                    ok: 1,
                };
            });
    });

    test('It should fail to hit ack mpe join room as request set header is invalid', async (assert) => {
        const creatorUserID = datatype.uuid();
        const joiningUserID = datatype.uuid();
        const mpeRoomIDToAssociate = datatype.uuid();
        const state = generateMpeWorkflowState({
            roomID: mpeRoomIDToAssociate,
            roomCreatorUserID: creatorUserID,
        });

        sinon
            .stub(MpeServerToTemporalController, 'joinWorkflow')
            .callsFake(async ({ userID, workflowID, userHasBeenInvited }) => {
                const response: MpeAcknowledgeJoinRequestBody = {
                    joiningUserID: userID,
                    state: {
                        ...state,
                        userRelatedInformation: {
                            userHasBeenInvited: false,
                            userID: joiningUserID,
                        },
                    },
                };

                assert.equal(userID, joiningUserID);
                assert.equal(workflowID, mpeRoomIDToAssociate);
                assert.isFalse(userHasBeenInvited);

                setImmediate(async () => {
                    await supertest(BASE_URL)
                        .post(
                            urlcat(
                                TEST_MPE_TEMPORAL_LISTENER,
                                'acknowledge-join',
                            ),
                        )
                        .set('Authorization', random.word())
                        .send(response)
                        .expect(401);
                });

                return {
                    ok: 1,
                };
            });
    });

    test('JoiningUser should join the given mpe room', async (assert) => {
        const creatorUserID = datatype.uuid();
        const joiningUserID = datatype.uuid();
        const mpeRoomIDToAssociate = datatype.uuid();
        const state = generateMpeWorkflowState({
            roomID: mpeRoomIDToAssociate,
            roomCreatorUserID: creatorUserID,
        });

        //Creator
        const creatorSocket = await createAuthenticatedUserAndGetSocket({
            userID: creatorUserID,
            mpeRoomIDToAssociate: [{ roomID: mpeRoomIDToAssociate }],
        });
        const creatorToken = getSocketApiAuthToken(creatorSocket);
        const creatorSocketB = await createSocketConnection({
            userID: creatorUserID,
            token: creatorToken,
        });
        ///

        //Joiner
        const joiningUserSocket = await createAuthenticatedUserAndGetSocket({
            userID: joiningUserID,
        });
        const joiningUserToken = getSocketApiAuthToken(joiningUserSocket);
        const joiningUserSocketB = await createSocketConnection({
            userID: joiningUserID,
            token: joiningUserToken,
        });

        //Creator
        const creatorSocketUsersLengthUpdateSpy = createSpyOnClientSocketEvent(
            creatorSocket,
            'MPE_USERS_LENGTH_UPDATE',
        );
        const creatorSocketJoinCallbackSpy = createSpyOnClientSocketEvent(
            creatorSocket,
            'MPE_JOIN_ROOM_CALLBACK',
        );

        //Creator Device B
        const creatorSocketBUsersLengthUpdateSpy = createSpyOnClientSocketEvent(
            creatorSocketB,
            'MPE_USERS_LENGTH_UPDATE',
        );
        const creatorSocketBJoinCallbackSpy = createSpyOnClientSocketEvent(
            creatorSocketB,
            'MPE_JOIN_ROOM_CALLBACK',
        );

        //Joiner
        const joiningUserSocketUsersLengthUpdateSpy =
            createSpyOnClientSocketEvent(
                joiningUserSocket,
                'MPE_USERS_LENGTH_UPDATE',
            );
        const joiningUserSocketJoinCallbackSpy = createSpyOnClientSocketEvent(
            joiningUserSocket,
            'MPE_JOIN_ROOM_CALLBACK',
        );

        //Joiner Device B
        const joiningUserSocketBUsersLengthUpdateSpy =
            createSpyOnClientSocketEvent(
                joiningUserSocketB,
                'MPE_USERS_LENGTH_UPDATE',
            );
        const joiningUserSocketBJoinCallbackSpy = createSpyOnClientSocketEvent(
            joiningUserSocketB,
            'MPE_JOIN_ROOM_CALLBACK',
        );

        ///

        sinon
            .stub(MpeServerToTemporalController, 'joinWorkflow')
            .callsFake(async ({ userID, workflowID, userHasBeenInvited }) => {
                const response: MpeAcknowledgeJoinRequestBody = {
                    joiningUserID: userID,
                    state: {
                        ...state,
                        userRelatedInformation: {
                            userHasBeenInvited: false,
                            userID: joiningUserID,
                        },
                    },
                };

                assert.equal(userID, joiningUserID);
                assert.equal(workflowID, mpeRoomIDToAssociate);
                assert.isFalse(userHasBeenInvited);

                setImmediate(async () => {
                    await supertest(BASE_URL)
                        .post(
                            urlcat(
                                TEST_MPE_TEMPORAL_LISTENER,
                                'acknowledge-join',
                            ),
                        )
                        .set('Authorization', TEMPORAL_ADONIS_KEY_HEADER)
                        .send(response)
                        .expect(200);
                });

                return {
                    ok: 1,
                };
            });

        joiningUserSocket.emit('MPE_JOIN_ROOM', {
            roomID: mpeRoomIDToAssociate,
        });

        await waitFor(() => {
            //creator
            assert.isTrue(creatorSocketUsersLengthUpdateSpy.calledOnce);
            assert.isTrue(creatorSocketJoinCallbackSpy.notCalled);
            assert.isTrue(creatorSocketBUsersLengthUpdateSpy.calledOnce);
            assert.isTrue(creatorSocketBJoinCallbackSpy.notCalled);

            //JoiningUser
            assert.isTrue(joiningUserSocketUsersLengthUpdateSpy.calledOnce);
            assert.isTrue(joiningUserSocketJoinCallbackSpy.calledOnce);
            assert.isTrue(joiningUserSocketBUsersLengthUpdateSpy.calledOnce);
            assert.isTrue(joiningUserSocketBJoinCallbackSpy.calledOnce);
        });
    });

    test('User should not be able to join a room he has already joined', async (assert) => {
        const creatorUserID = datatype.uuid();
        const mpeRoomIDToAssociate = datatype.uuid();

        //Creator
        const creatorSocket = await createAuthenticatedUserAndGetSocket({
            userID: creatorUserID,
            mpeRoomIDToAssociate: [{ roomID: mpeRoomIDToAssociate }],
        });
        const creatorToken = getSocketApiAuthToken(creatorSocket);
        const creatorSocketB = await createSocketConnection({
            userID: creatorUserID,
            token: creatorToken,
        });
        ///

        //Creator
        const creatorSocketUsersLengthUpdateSpy = createSpyOnClientSocketEvent(
            creatorSocket,
            'MPE_USERS_LENGTH_UPDATE',
        );
        const creatorSocketJoinCallbackSpy = createSpyOnClientSocketEvent(
            creatorSocket,
            'MPE_JOIN_ROOM_CALLBACK',
        );

        //Creator Device B
        const creatorSocketBUsersLengthUpdateSpy = createSpyOnClientSocketEvent(
            creatorSocketB,
            'MPE_USERS_LENGTH_UPDATE',
        );
        const creatorSocketBJoinCallbackSpy = createSpyOnClientSocketEvent(
            creatorSocketB,
            'MPE_JOIN_ROOM_CALLBACK',
        );

        sinon
            .stub(MpeServerToTemporalController, 'joinWorkflow')
            .callsFake(async () => {
                assert.isFalse(true);

                return {
                    ok: 1,
                };
            });

        creatorSocketB.emit('MPE_JOIN_ROOM', {
            roomID: mpeRoomIDToAssociate,
        });

        await waitFor(() => {
            //creator
            assert.isTrue(creatorSocketUsersLengthUpdateSpy.notCalled);
            assert.isTrue(creatorSocketJoinCallbackSpy.notCalled);
            assert.isTrue(creatorSocketBUsersLengthUpdateSpy.notCalled);
            assert.isTrue(creatorSocketBJoinCallbackSpy.notCalled);
        });
    });
});
