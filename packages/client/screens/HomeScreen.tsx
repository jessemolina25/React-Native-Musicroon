import { MtvWorkflowState } from '@musicroom/types';
import { Button } from 'dripsy';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    AppScreen,
    AppScreenContainer,
    AppScreenHeader,
} from '../components/kit';
import { useMusicPlayerContext } from '../hooks/musicPlayerHooks';
import { useUserContext } from '../hooks/userHooks';
import { HomeTabHomeScreenScreenProps } from '../types';

const HomeScreen: React.FC<HomeTabHomeScreenScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { sendToMusicPlayerMachine } = useMusicPlayerContext();
    const { sendToUserMachine } = useUserContext();
    return (
        <AppScreen>
            <AppScreenHeader title="Home" insetTop={insets.top} />

            <AppScreenContainer>
                <Button
                    title="Go to Music Track Vote"
                    onPress={() => {
                        navigation.navigate('MusicTrackVoteSearch');
                    }}
                />

                <Button
                    title="Go settings"
                    onPress={() => {
                        navigation.navigate('Settings');
                    }}
                />
                <Button
                    title="Suggest track modal"
                    onPress={() => {
                        navigation.navigate('SuggestTrack', {
                            screen: 'SuggestTrackModal',
                        });
                    }}
                />
                <Button
                    title="Go to users search"
                    onPress={() => {
                        navigation.navigate('MusicTrackVoteUsersSearch', {
                            screen: 'MusicTrackVoteUsersSearchModal',
                        });
                    }}
                />

                <Button
                    title="Ask for geoloc"
                    onPress={() => {
                        sendToUserMachine({
                            type: 'REQUEST_DEDUPLICATE_LOCATION_PERMISSION',
                        });
                    }}
                />

                <Button
                    title="Go to my profile screen"
                    onPress={() => {
                        navigation.navigate('UserProfile', {
                            userID: 'just a fake user id',
                        });
                    }}
                />

                <Button
                    title="Inject fake room"
                    onPress={() => {
                        const fakeState: MtvWorkflowState = {
                            currentTrack: {
                                artistName: 'artistName',
                                title: 'title',
                                duration: 1000,
                                elapsed: 1,
                                score: 1,
                                id: 'sDNwx9XYWIs',
                            },
                            name: 'JUST A FAKE ROOM',
                            playing: false,
                            roomCreatorUserID: 'JUST A CREATOR ID',
                            roomID: 'JUST A ROOM ID',
                            playingMode: 'BROADCAST',
                            tracks: null,
                            minimumScoreToBePlayed: 1,
                            isOpen: true,
                            isOpenOnlyInvitedUsersCanVote: false,
                            hasTimeAndPositionConstraints: false,
                            timeConstraintIsValid: null,
                            delegationOwnerUserID: null,
                            userRelatedInformation: {
                                hasControlAndDelegationPermission: true,
                                userFitsPositionConstraint: null,
                                emittingDeviceID: 'EMITTING DEVICE',
                                userID: 'JUST A USER ID',
                                userHasBeenInvited: false,
                                tracksVotedFor: [],
                            },
                            usersLength: 2,
                        };

                        sendToMusicPlayerMachine({
                            type: 'RETRIEVE_CONTEXT',
                            state: fakeState,
                        });
                    }}
                />
            </AppScreenContainer>
        </AppScreen>
    );
};

export default HomeScreen;
