import { Button } from '@dripsy/core';
import { MtvWorkflowState } from '@musicroom/types';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    AppScreen,
    AppScreenContainer,
    AppScreenHeader,
} from '../components/kit';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { HomeTabHomeScreenScreenProps } from '../types';

const HomeScreen: React.FC<HomeTabHomeScreenScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const musicPlayerMachine = useMusicPlayer();

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
                    title="Go chat"
                    onPress={() => {
                        navigation.navigate('Chat');
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
                    title="Inject fake room"
                    onPress={() => {
                        const fakeState: MtvWorkflowState = {
                            currentTrack: null,
                            name: 'JUST A FAKE ROOM',
                            playing: false,
                            roomCreatorUserID: 'JUST A CREATOR ID',
                            roomID: 'JUST A ROOM ID',
                            tracks: null,
                            minimumScoreToBePlayed: 1,
                            userRelatedInformation: {
                                emittingDeviceID: 'EMITTING DEVICE',
                                userID: 'JUST A USER ID',
                                tracksVotedFor: [],
                            },
                            usersLength: 2,
                        };

                        musicPlayerMachine.sendToMachine({
                            type: 'RETRIEVE_CONTEXT',
                            state: fakeState,
                        });
                    }}
                />

                <Button
                    title="Open mtv room creation form"
                    onPress={() => {
                        musicPlayerMachine.homeScreenMachineSend({
                            type: 'OPEN_SETTINGS',
                        });
                    }}
                />
            </AppScreenContainer>
        </AppScreen>
    );
};

export default HomeScreen;
