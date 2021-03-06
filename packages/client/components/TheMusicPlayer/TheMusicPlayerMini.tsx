import { Sender } from '@xstate/react/lib/types';
import { View } from 'dripsy';
import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import {
    AppMusicPlayerMachineEvent,
    AppMusicPlayerMachineState,
} from '../../machines/appMusicPlayerMachine';
import { Typo } from '../kit';
import AppBottomBarConstraint from '../kit/AppBottomBarConstraint';
import MusicPlayerControlButton from './MusicPlayerControlButton';

type TheMusicPlayerMiniProps = {
    height: number;
    musicPlayerState: AppMusicPlayerMachineState;
    hideControlButtons: boolean;
    sendToMusicPlayerMachine: Sender<AppMusicPlayerMachineEvent>;
    onPress: () => void;
};

const TheMusicPlayerMini: React.FC<TheMusicPlayerMiniProps> = ({
    musicPlayerState,
    height,
    hideControlButtons,
    sendToMusicPlayerMachine,
    onPress,
}) => {
    const { context } = musicPlayerState;
    const { currentTrack, playing } = context;
    const isInRoom = context.roomID !== '';
    const isPlaying = playing;
    const roomIsReady = musicPlayerState.hasTag('playerIsReady');

    function handlePlayPauseToggle() {
        sendToMusicPlayerMachine({ type: 'PLAY_PAUSE_TOGGLE' });
    }

    const firstLine = isInRoom
        ? context.name
        : 'Join a room to listen to music';
    const secondLine =
        isInRoom === true && currentTrack
            ? `${currentTrack.title} • ${currentTrack.artistName}`
            : 'Track-Artist';
    const showControlButton = !hideControlButtons;
    return (
        <AppBottomBarConstraint>
            <TouchableWithoutFeedback onPress={onPress}>
                <View
                    testID="music-player-mini"
                    sx={{
                        height,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 'l',
                        paddingRight: 'l',

                        backgroundColor: 'greyLight',
                        borderBottomColor: 'black',
                        borderBottomWidth: 1,
                    }}
                >
                    <View
                        sx={{
                            flex: 1,
                            justifyContent: 'center',
                            marginRight: 'xl',
                        }}
                    >
                        <Typo numberOfLines={1} sx={{ fontSize: 's' }}>
                            {firstLine}
                        </Typo>

                        <Typo
                            numberOfLines={1}
                            sx={{ fontSize: 'xs', color: 'greyLighter' }}
                        >
                            {secondLine}
                        </Typo>
                    </View>

                    {showControlButton && (
                        <MusicPlayerControlButton
                            iconName={isPlaying ? 'pause' : 'play'}
                            variant="normal"
                            adjustIconHorizontally={2}
                            disabled={!roomIsReady}
                            accessibilityLabel={
                                isPlaying ? 'Pause the video' : 'Play the video'
                            }
                            onPress={handlePlayPauseToggle}
                        />
                    )}
                </View>
            </TouchableWithoutFeedback>
        </AppBottomBarConstraint>
    );
};

export default TheMusicPlayerMini;
