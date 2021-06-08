import { Socket } from 'socket.io-client';
import { assign, createMachine, StateMachine } from 'xstate';

interface TrackVoteRoom {
    id: string;
    name: string;
}

interface TrackVoteTrack {
    name: string;
    artistName: string;
}
export interface AppMusicPlayerMachineContext {
    currentRoom?: TrackVoteRoom;
    currentTrack?: TrackVoteTrack;
}

export type AppMusicPlayerMachineEvent =
    | {
          type: 'CREATE_ROOM';
          roomName: string;
      }
    | { type: 'JOINED_ROOM'; room: TrackVoteRoom; track: TrackVoteTrack };

interface CreateAppMusicPlayerMachineArgs {
    socket: Socket;
}

export const createAppMusicPlayerMachine = ({
    socket,
}: CreateAppMusicPlayerMachineArgs): StateMachine<
    AppMusicPlayerMachineContext,
    any,
    AppMusicPlayerMachineEvent
> =>
    createMachine<AppMusicPlayerMachineContext, AppMusicPlayerMachineEvent>({
        context: {
            currentRoom: undefined,
            currentTrack: undefined,
        },

        initial: 'waitingJoiningRoom',

        states: {
            waitingJoiningRoom: {
                on: {
                    CREATE_ROOM: {
                        target: 'connectingToRoom',
                    },
                },
            },

            connectingToRoom: {
                invoke: {
                    src: (_context, event) => (sendBack) => {
                        if (event.type !== 'CREATE_ROOM') {
                            throw new Error(
                                'Service must be called in reaction to CREATE_ROOM event',
                            );
                        }

                        console.log('roomName', event.roomName);

                        sendBack({
                            type: 'JOINED_ROOM',
                            room: {
                                id: event.roomName,
                                name: event.roomName,
                            },
                            track: {
                                name: 'Monde Nouveau',
                                artistName: 'Feu! Chatterton',
                            },
                        });
                    },
                },

                on: {
                    JOINED_ROOM: {
                        target: 'connectedToRoom',
                        actions: assign((context, event) => {
                            if (event.type !== 'JOINED_ROOM') {
                                return context;
                            }

                            return {
                                ...context,
                                currentRoom: event.room,
                                currentTrack: event.track,
                            };
                        }),
                    },
                },
            },

            connectedToRoom: {},
        },
    });