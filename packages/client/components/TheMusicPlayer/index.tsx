import React from 'react';
import { useBackHandler } from '@react-native-community/hooks';
import { useSx, View } from 'dripsy';
import { TouchableWithoutFeedback } from 'react-native';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import TheMusicPlayerMini from './TheMusicPlayerMini';
import TheMusicPlayerFullScreen from './TheMusicPlayerFullScreen';

type TheMusicPlayerProps = {
    isFullScreen: boolean;
    setIsFullScren: (isOpen: boolean) => void;
};

const TheMusicPlayer: React.FC<TheMusicPlayerProps> = ({
    isFullScreen,
    setIsFullScren,
}) => {
    const MINI_PLAYER_HEIGHT = 52;
    const sx = useSx();
    const { state, sendToMachine, setPlayerRef } = useMusicPlayer();
    const { currentRoom, currentTrack, tracksList } = state.context;
    const isInRoom = currentRoom !== undefined;
    function openPlayerInFullScreen() {
        if (isInRoom === true) {
            setIsFullScren(true);
        }
    }

    useBackHandler(() => {
        if (isFullScreen) {
            setIsFullScren(false);
            return true;
        }

        return false;
    });

    return (
        <TouchableWithoutFeedback onPress={openPlayerInFullScreen}>
            <View
                style={sx({
                    backgroundColor: 'greyLight',
                    borderBottomColor: 'black',
                    borderBottomWidth: 1,
                    position: isFullScreen ? 'absolute' : 'relative',
                    top: isFullScreen ? -1 * MINI_PLAYER_HEIGHT : 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    zIndex: 20,
                })}
            >
                <TheMusicPlayerMini
                    height={MINI_PLAYER_HEIGHT}
                    roomName={currentRoom?.name}
                    currentTrackName={currentTrack?.title}
                    currentTrackArtist={currentTrack?.artistName}
                />

                {isInRoom &&
                    currentRoom !== undefined &&
                    currentTrack !== undefined &&
                    tracksList !== undefined && (
                        <View
                            accessibilityState={{
                                expanded: isFullScreen === true,
                            }}
                            style={{
                                flex: 1,
                                transform: [
                                    { translateY: isFullScreen ? 0 : 200 },
                                ],
                            }}
                        >
                            <TheMusicPlayerFullScreen
                                dismissFullScreenPlayer={() => {
                                    setIsFullScren(false);
                                }}
                                roomName={currentRoom.name}
                                currentTrack={currentTrack}
                                nextTracksList={tracksList.slice(1)}
                                sendToMachine={sendToMachine}
                                machineState={state}
                                setPlayerRef={setPlayerRef}
                            />
                        </View>
                    )}
            </View>
        </TouchableWithoutFeedback>
    );
};

export default TheMusicPlayer;