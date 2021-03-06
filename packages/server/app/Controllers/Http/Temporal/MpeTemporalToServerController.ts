import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import {
    MpeRejectAddingTracksRequestBody,
    MpeWorkflowStateWithUserRelatedInformation,
    MpeAcknowledgeAddingTracksRequestBody,
    MpeRejectChangeTrackOrderRequestBody,
    MpeAcknowledgeChangeTrackOrderRequestBody,
    MpeAcknowledgeDeletingTracksRequestBody,
    MpeAcknowledgeJoinRequestBody,
    MpeAcknowledgeLeaveRequestBody,
    MpeRequestMtvRoomCreationRequestBody,
} from '@musicroom/types';
import invariant from 'tiny-invariant';
import Device from 'App/Models/Device';
import MpeRoom from 'App/Models/MpeRoom';
import User from 'App/Models/User';
import MtvRoomService from 'App/Services/MtvRoomService';
import UserService from 'App/Services/UserService';
import Ws from 'App/Services/Ws';

export default class MpeTemporalToServerController {
    public async mpeCreationAcknowledgement({
        request,
    }: HttpContextContract): Promise<void> {
        console.log('RECEIVED MPE ROOM CREATION ACKNOWLEDGEMENT');
        const state = MpeWorkflowStateWithUserRelatedInformation.parse(
            request.body(),
        );

        Ws.io.to(state.roomID).emit('MPE_CREATE_ROOM_CALLBACK', state);
    }

    public async mpeJoinAcknowledgement({
        request,
    }: HttpContextContract): Promise<void> {
        console.log('RECEIVED MPE JOIN ROOM ACK');

        const { state: stateWithUserRelatedInformation, joiningUserID } =
            MpeAcknowledgeJoinRequestBody.parse(request.body());
        const { roomID } = stateWithUserRelatedInformation;

        const joiningUser = await User.findOrFail(joiningUserID);
        const mpeRoom = await MpeRoom.findOrFail(roomID);

        await UserService.joinEveryUserDevicesToRoom(joiningUser, roomID);

        await joiningUser.related('mpeRooms').save(mpeRoom);

        await UserService.emitEventInEveryDeviceUser(
            joiningUserID,
            'MPE_JOIN_ROOM_CALLBACK',
            [
                {
                    roomID,
                    state: stateWithUserRelatedInformation,
                    userIsNotInRoom: false,
                },
            ],
        );

        Ws.io.to(roomID).emit('MPE_USERS_LENGTH_UPDATE', {
            state: {
                ...stateWithUserRelatedInformation,
                userRelatedInformation: null,
            },
            roomID,
        });
    }

    public async mpeLeaveAcknowledgement({
        request,
    }: HttpContextContract): Promise<void> {
        console.log('RECEIVED MPE LEAVE ROOM ACK');

        const { state } = MpeAcknowledgeLeaveRequestBody.parse(request.body());
        const { roomID } = state;

        Ws.io.to(roomID).emit('MPE_USERS_LENGTH_UPDATE', {
            state,
            roomID,
        });
    }

    public async addingTracksRejection({
        request,
    }: HttpContextContract): Promise<void> {
        const { roomID, deviceID } = MpeRejectAddingTracksRequestBody.parse(
            request.body(),
        );

        const device = await Device.findOrFail(deviceID);

        Ws.io.to(device.socketID).emit('MPE_ADD_TRACKS_FAIL_CALLBACK', {
            roomID,
        });
    }

    public async addingTracksAcknowledgement({
        request,
    }: HttpContextContract): Promise<void> {
        const {
            state,
            state: { roomID },
            deviceID,
        } = MpeAcknowledgeAddingTracksRequestBody.parse(request.body());

        const device = await Device.findOrFail(deviceID);

        Ws.io.to(device.socketID).emit('MPE_ADD_TRACKS_SUCCESS_CALLBACK', {
            roomID,
            state,
        });

        Ws.io
            .to(roomID)
            .except(device.socketID)
            .emit('MPE_TRACKS_LIST_UPDATE', {
                roomID,
                state,
            });
    }

    public async changeTrackOrderAcknowledgement({
        request,
    }: HttpContextContract): Promise<void> {
        const { state, deviceID } =
            MpeAcknowledgeChangeTrackOrderRequestBody.parse(request.body());

        const device = await Device.findOrFail(deviceID);
        Ws.io
            .to(device.socketID)
            .emit('MPE_CHANGE_TRACK_ORDER_SUCCESS_CALLBACK', {
                roomID: state.roomID,
                state,
            });

        Ws.io
            .to(state.roomID)
            .except(device.socketID)
            .emit('MPE_TRACKS_LIST_UPDATE', { roomID: state.roomID, state });
    }

    public async changeTrackOrderRejection({
        request,
    }: HttpContextContract): Promise<void> {
        const { deviceID, roomID } = MpeRejectChangeTrackOrderRequestBody.parse(
            request.body(),
        );

        const device = await Device.findOrFail(deviceID);
        Ws.io.to(device.socketID).emit('MPE_CHANGE_TRACK_ORDER_FAIL_CALLBACK', {
            roomID,
        });
    }

    public async deleteTracksAcknowledgement({
        request,
    }: HttpContextContract): Promise<void> {
        const { state, deviceID } =
            MpeAcknowledgeDeletingTracksRequestBody.parse(request.body());

        const device = await Device.findOrFail(deviceID);

        Ws.io.to(device.socketID).emit('MPE_DELETE_TRACKS_SUCCESS_CALLBACK', {
            roomID: state.roomID,
            state,
        });

        Ws.io
            .to(state.roomID)
            .except(device.socketID)
            .emit('MPE_TRACKS_LIST_UPDATE', { roomID: state.roomID, state });
    }

    public async requestMtvRoomCreation({
        request,
    }: HttpContextContract): Promise<void> {
        const { userID, deviceID, tracksIDs, mtvRoomOptions } =
            MpeRequestMtvRoomCreationRequestBody.parse(request.body());

        MtvRoomService.validateMtvRoomOptions(mtvRoomOptions);

        const user = await User.findOrFail(userID);
        const currentMtvRoomID = user.mtvRoomID ?? undefined;

        const device = await user
            .related('devices')
            .query()
            .where('uuid', deviceID)
            .first();
        const isUserDevice = device !== null;
        invariant(isUserDevice === true, 'Device does not belong to user');

        await MtvRoomService.createMtvRoom({
            user,
            deviceID,
            options: {
                ...mtvRoomOptions,
                initialTracksIDs: tracksIDs,
            },
            currentMtvRoomID,
        });
    }
}
