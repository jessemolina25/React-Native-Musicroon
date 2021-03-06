import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import {
    MtvWorkflowState,
    MtvWorkflowStateWithUserRelatedInformation,
} from '@musicroom/types';
import MtvRoomsWsController from 'App/Controllers/Ws/MtvRoomsWsController';
import Device from 'App/Models/Device';
import MtvRoom from 'App/Models/MtvRoom';
import User from 'App/Models/User';
import UserService from 'App/Services/UserService';
import Ws from 'App/Services/Ws';
import * as z from 'zod';

const MtvTemporalToServerJoinBody = z.object({
    joiningUserID: z.string().uuid(),
    state: MtvWorkflowStateWithUserRelatedInformation,
});

type MtvTemporalToServerJoinBody = z.infer<typeof MtvTemporalToServerJoinBody>;

export const MtvTemporalToServerLeaveBody = z.object({
    leavingUserID: z.string().uuid(),
    state: MtvWorkflowState,
});

export type MtvTemporalToServerLeaveBody = z.infer<
    typeof MtvTemporalToServerLeaveBody
>;

export default class MtvTemporalToServerController {
    public pause({ request }: HttpContextContract): void {
        const state = MtvWorkflowState.parse(request.body());
        const roomID = state.roomID;

        console.log('received pause from temporal', state);

        Ws.io.to(roomID).emit('MTV_ACTION_PAUSE_CALLBACK', state);
    }

    public play({ request }: HttpContextContract): void {
        const state = MtvWorkflowState.parse(request.body());
        const roomID = state.roomID;

        console.log('received play from temporal', state);

        Ws.io.to(roomID).emit('MTV_ACTION_PLAY_CALLBACK', state);
    }

    public userLengthUpdate({ request }: HttpContextContract): void {
        const state = MtvWorkflowState.parse(request.body());
        const roomID = state.roomID;

        console.log('received userLengthUpdate from temporal', state);

        Ws.io.to(roomID).emit('MTV_USERS_LIST_FORCED_REFRESH');
        Ws.io.to(roomID).emit('MTV_USER_LENGTH_UPDATE', state);
    }

    public async mtvCreationAcknowledgement({
        request,
    }: HttpContextContract): Promise<void> {
        const state = MtvWorkflowStateWithUserRelatedInformation.parse(
            request.body(),
        );

        Ws.io.to(state.roomID).emit('MTV_CREATE_ROOM_CALLBACK', state);
        const creator = await User.findOrFail(state.roomCreatorUserID);

        const emittingDevice = await Device.findOrFail(
            state.userRelatedInformation.emittingDeviceID,
        );
        emittingDevice.isEmitting = true;
        await emittingDevice.save();

        //Not loading for creator.mtvRoom relationShips as we don't know if temporal
        //will be faster to send back a response than adonis to execute the end of the
        //onCreate MtvWsController method
        //Also even if the room is created before the temporal response it's might not be updated
        //This use case appears in test but rarely in reality
        const mtvRoom = await MtvRoom.findOrFail(state.roomID);
        if (mtvRoom === null) {
            throw new Error('Should never occurs mtvRoom is null');
        }

        const {
            constraintLat,
            constraintLng,
            constraintRadius,
            hasPositionAndTimeConstraints,
            runID,
            uuid: roomID,
        } = mtvRoom;
        await MtvRoomsWsController.checkUserDevicesPositionIfRoomHasPositionConstraints(
            {
                user: creator,
                roomConstraintInformation: {
                    constraintLat,
                    constraintLng,
                    constraintRadius,
                    hasPositionAndTimeConstraints,
                },
                persistToTemporalRequiredInformation: {
                    runID,
                    roomID,
                },
            },
        );
    }

    public async join({ request }: HttpContextContract): Promise<void> {
        const { state, joiningUserID } = MtvTemporalToServerJoinBody.parse(
            request.body(),
        );
        const { roomID } = state;

        const joiningUser = await User.findOrFail(joiningUserID);
        const mtvRoom = await MtvRoom.findOrFail(roomID);

        await UserService.joinEveryUserDevicesToRoom(joiningUser, roomID);

        joiningUser.mtvRoomID = roomID;
        await joiningUser.related('mtvRoom').associate(mtvRoom);
        await joiningUser.save();

        await UserService.emitEventInEveryDeviceUser(
            joiningUserID,
            'MTV_JOIN_ROOM_CALLBACK',
            [state],
        );

        const emittingDevice = await Device.findOrFail(
            state.userRelatedInformation.emittingDeviceID,
        );
        emittingDevice.isEmitting = true;
        await emittingDevice.save();

        const {
            constraintLat,
            constraintLng,
            constraintRadius,
            hasPositionAndTimeConstraints,
            runID,
        } = mtvRoom;
        await MtvRoomsWsController.checkUserDevicesPositionIfRoomHasPositionConstraints(
            {
                user: joiningUser,
                roomConstraintInformation: {
                    constraintLat,
                    constraintLng,
                    constraintRadius,
                    hasPositionAndTimeConstraints,
                },
                persistToTemporalRequiredInformation: {
                    roomID,
                    runID,
                },
            },
        );
    }

    public async leave({ request }: HttpContextContract): Promise<void> {
        const { state } = MtvTemporalToServerLeaveBody.parse(request.body());

        Ws.io.to(state.roomID).emit('MTV_USERS_LIST_FORCED_REFRESH');
    }

    public async mtvChangeUserEmittingDeviceAcknowledgement({
        request,
    }: HttpContextContract): Promise<void> {
        const state = MtvWorkflowState.parse(request.body());

        if (state.userRelatedInformation === null) {
            throw new Error(
                'Error on temporal response for mtvChangeUserEmittingDeviceAcknowledgement userRelatedInformations shouldnt be null',
            );
        }

        const previouslyEmittingDevice =
            await UserService.getUserCurrentlyEmittingDevice(
                state.userRelatedInformation.userID,
            );
        if (previouslyEmittingDevice !== undefined) {
            /**
             * This case won't occurs when an emitting device gets disconnected
             * At the contrary it will on basic emitting device switch
             */
            previouslyEmittingDevice.isEmitting = false;
            await previouslyEmittingDevice.save();
        }

        const emittingDevice = await Device.findOrFail(
            state.userRelatedInformation.emittingDeviceID,
        );
        emittingDevice.isEmitting = true;
        await emittingDevice.save();

        await UserService.emitEventInEveryDeviceUser(
            state.userRelatedInformation.userID,
            'MTV_CHANGE_EMITTING_DEVICE_CALLBACK',
            [state],
        );
    }

    public suggestOrVoteTracksListUpdate({
        request,
    }: HttpContextContract): void {
        const state = MtvWorkflowState.parse(request.body());
        const roomID = state.roomID;

        Ws.io.to(roomID).emit('MTV_VOTE_OR_SUGGEST_TRACKS_LIST_UPDATE', state);
    }

    public async acknowledgeTracksSuggestion({
        request,
    }: HttpContextContract): Promise<void> {
        const AcknowledgeTracksSuggestionRequestBody = z.object({
            state: MtvWorkflowStateWithUserRelatedInformation,
            deviceID: z.string().uuid(),
        });

        const { deviceID, state } =
            AcknowledgeTracksSuggestionRequestBody.parse(request.body());

        const device = await Device.findOrFail(deviceID);

        Ws.io.in(device.socketID).emit('MTV_SUGGEST_TRACKS_CALLBACK');

        await UserService.emitEventInEveryDeviceUser(
            state.userRelatedInformation.userID,
            'MTV_VOTE_OR_SUGGEST_TRACK_CALLBACK',
            [state],
        );
    }

    public async acknowledgeTracksSuggestionFail({
        request,
    }: HttpContextContract): Promise<void> {
        const AcknowledgeTracksSuggestionFailRequestBody = z.object({
            deviceID: z.string().uuid(),
        });

        const { deviceID } = AcknowledgeTracksSuggestionFailRequestBody.parse(
            request.body(),
        );

        const device = await Device.findOrFail(deviceID);

        Ws.io.in(device.socketID).emit('MTV_SUGGEST_TRACKS_FAIL_CALLBACK');
    }

    public async acknowledgeUserVoteForTrack({
        request,
    }: HttpContextContract): Promise<void> {
        const state = MtvWorkflowStateWithUserRelatedInformation.parse(
            request.body(),
        );

        await UserService.emitEventInEveryDeviceUser(
            state.userRelatedInformation.userID,
            'MTV_VOTE_OR_SUGGEST_TRACK_CALLBACK',
            [state],
        );
    }

    public acknowledgeUpdateDelegationOwner({
        request,
    }: HttpContextContract): void {
        const state = MtvWorkflowState.parse(request.body());

        Ws.io
            .to(state.roomID)
            .emit('MTV_UPDATE_DELEGATION_OWNER_CALLBACK', state);
        Ws.io.to(state.roomID).emit('MTV_USERS_LIST_FORCED_REFRESH');
    }

    public async acknowledgeUpdateUserFitsPositionConstraint({
        request,
    }: HttpContextContract): Promise<void> {
        const state = MtvWorkflowStateWithUserRelatedInformation.parse(
            request.body(),
        );

        await UserService.emitEventInEveryDeviceUser(
            state.userRelatedInformation.userID,
            'MTV_USER_PERMISSIONS_UPDATE',
            [state],
        );
    }

    public async acknowledgeUpdateControlAndDelegationPermission({
        request,
    }: HttpContextContract): Promise<void> {
        const state = MtvWorkflowStateWithUserRelatedInformation.parse(
            request.body(),
        );

        await UserService.emitEventInEveryDeviceUser(
            state.userRelatedInformation.userID,
            'MTV_USER_PERMISSIONS_UPDATE',
            [state],
        );
        Ws.io.to(state.roomID).emit('MTV_USERS_LIST_FORCED_REFRESH');
    }

    public async acknowledgeUpdateTimeConstraint({
        request,
    }: HttpContextContract): Promise<void> {
        const state = MtvWorkflowState.parse(request.body());

        Ws.io.to(state.roomID).emit('MTV_TIME_CONSTRAINT_UPDATE', state);
    }
}
