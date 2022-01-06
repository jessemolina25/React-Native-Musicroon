/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/
// import Redis from '@ioc:Adonis/Addons/Redis';
import Route from '@ioc:Adonis/Core/Route';

Route.get('/search/track/:query', 'TracksSearchesController.searchTrackName');

Route.post('/search/rooms', 'MtvRoomsHttpController.fetchMtvRooms');

Route.post('/search/users', 'SearchUsersController.searchUsers');

Route.get('/ping', () => console.log('pong'));

Route.get('/proxy-places-api/*', 'PlacesApisController.proxyPlacesAPIRequest');

Route.post('/mpe/search/user-rooms', 'MpeRoomsHttpController.listAllUserRooms');

Route.post('/mpe/search/all-rooms', 'MpeRoomsHttpController.listAllRooms');

/// Temporal MTV Routes ///

export const MTV_TEMPORAL_LISTENER = `/temporal/mtv`;

Route.group(() => {
    Route.post(
        `/mtv-creation-acknowledgement`,
        'Temporal/MtvTemporalToServerController.mtvCreationAcknowledgement',
    );

    Route.post(`/play`, 'Temporal/MtvTemporalToServerController.play');

    Route.post(`/pause`, 'Temporal/MtvTemporalToServerController.pause');

    Route.post(`/join`, 'Temporal/MtvTemporalToServerController.join');

    Route.post(`/leave`, 'Temporal/MtvTemporalToServerController.leave');

    Route.post(
        `/change-user-emitting-device`,
        'Temporal/MtvTemporalToServerController.mtvChangeUserEmittingDeviceAcknowledgement',
    );

    Route.post(
        `/user-length-update`,
        'Temporal/MtvTemporalToServerController.userLengthUpdate',
    );

    Route.post(
        `/suggest-or-vote-update`,
        'Temporal/MtvTemporalToServerController.suggestOrVoteTracksListUpdate',
    );

    Route.post(
        `/acknowledge-tracks-suggestion`,
        'Temporal/MtvTemporalToServerController.acknowledgeTracksSuggestion',
    );

    Route.post(
        `/acknowledge-tracks-suggestion-fail`,
        'Temporal/MtvTemporalToServerController.acknowledgeTracksSuggestionFail',
    );

    Route.post(
        `/acknowledge-user-vote-for-track`,
        'Temporal/MtvTemporalToServerController.acknowledgeUserVoteForTrack',
    );

    Route.post(
        `/acknowledge-update-user-fits-position-constraint`,
        'Temporal/MtvTemporalToServerController.acknowledgeUserVoteForTrack',
    );

    Route.post(
        `/acknowledge-update-delegation-owner`,
        'Temporal/MtvTemporalToServerController.acknowledgeUpdateDelegationOwner',
    );

    Route.post(
        `/acknowledge-update-control-and-delegation-permission`,
        'Temporal/MtvTemporalToServerController.acknowledgeUpdateControlAndDelegationPermission',
    );

    Route.post(
        `/acknowledge-update-time-constraint`,
        'Temporal/MtvTemporalToServerController.acknowledgeUpdateTimeConstraint',
    );
}).prefix(MTV_TEMPORAL_LISTENER);

/// //////// ////// ///

/// Temporal MPE Routes ///

export const MPE_TEMPORAL_LISTENER = `/temporal/mpe`;

Route.group(() => {
    Route.post(
        `/mpe-creation-acknowledgement`,
        'Temporal/MpeTemporalToServerController.mpeCreationAcknowledgement',
    );

    Route.post(
        `/reject-adding-tracks`,
        'Temporal/MpeTemporalToServerController.addingTracksRejection',
    );

    Route.post(
        `/acknowledge-adding-tracks`,
        'Temporal/MpeTemporalToServerController.addingTracksAcknowledgement',
    );

    Route.post(
        `/acknowledge-change-track-order`,
        'Temporal/MpeTemporalToServerController.changeTrackOrderAcknowledgement',
    );
    Route.post(
        `/reject-change-track-order`,
        'Temporal/MpeTemporalToServerController.changeTrackOrderRejection',
    );

    Route.post(
        `/acknowledge-deleting-tracks`,
        'Temporal/MpeTemporalToServerController.deleteTracksAcknowledgement',
    );

    Route.post(
        `/acknowledge-join`,
        `Temporal/MpeTemporalToServerController.mpeJoinAcknowledgement`,
    );

    Route.post(
        `/request-mtv-room-creation`,
        'Temporal/MpeTemporalToServerController.requestMtvRoomCreation',
    );

    Route.post(
        `/acknowledge-leave`,
        `Temporal/MpeTemporalToServerController.mpeLeaveAcknowledgement`,
    );
}).prefix(MPE_TEMPORAL_LISTENER);

/// //////// ////// ///

Route.get('/', () => {
    return { hello: 'world' };
});
