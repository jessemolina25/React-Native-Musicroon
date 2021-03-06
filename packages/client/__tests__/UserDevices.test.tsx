import { MtvWorkflowState, UserDevice } from '@musicroom/types';
import { datatype, random } from 'faker';
import { serverSocket } from '../services/websockets';
import { generateTrackMetadata } from '../tests/data';
import { fireEvent, renderApp, waitFor, within } from '../tests/tests-utils';

test(`
On userMachine mounting it should retrieve user connected devices and list them in the MTV settings section
after user clicked on change emitting device button
After clicking on one not emitting device card it should set the clicked one as emitting`, async () => {
    const userDevices: UserDevice[] = Array.from({ length: 3 }).map(() => ({
        deviceID: datatype.uuid(),
        name: random.word(),
    }));
    const thisDevice = userDevices[0];
    const userID = datatype.uuid();
    const tracksList = [generateTrackMetadata(), generateTrackMetadata()];

    const state: MtvWorkflowState = {
        roomID: datatype.uuid(),
        name: random.word(),
        playing: false,
        usersLength: 1,
        playingMode: 'BROADCAST',
        isOpen: true,
        isOpenOnlyInvitedUsersCanVote: false,
        hasTimeAndPositionConstraints: false,
        timeConstraintIsValid: null,
        delegationOwnerUserID: null,
        userRelatedInformation: {
            hasControlAndDelegationPermission: true,
            userFitsPositionConstraint: null,
            userHasBeenInvited: false,
            emittingDeviceID: thisDevice.deviceID,
            userID,
            tracksVotedFor: [],
        },
        roomCreatorUserID: userID,
        currentTrack: {
            ...tracksList[0],
            elapsed: 0,
        },
        tracks: tracksList.slice(1),
        minimumScoreToBePlayed: 1,
    };

    serverSocket.on('GET_CONNECTED_DEVICES_AND_DEVICE_ID', (cb) => {
        cb({
            currDeviceID: thisDevice.deviceID,
            devices: userDevices,
        });
    });

    serverSocket.on('MTV_CHANGE_EMITTING_DEVICE', ({ newEmittingDeviceID }) => {
        serverSocket.emit('MTV_CHANGE_EMITTING_DEVICE_CALLBACK', {
            ...state,
            userRelatedInformation: {
                ...state.userRelatedInformation!,
                emittingDeviceID: newEmittingDeviceID,
            },
        });
    });

    serverSocket.on('MTV_GET_CONTEXT', () => {
        serverSocket.emit('MTV_RETRIEVE_CONTEXT', state);
    });

    const screen = await renderApp();

    /**
     * Retrieve context to have the appMusicPlayerMachine directly
     * in state connectedToRoom
     * And toggle mtv room full screen
     */

    expect(screen.getAllByText(/home/i).length).toBeGreaterThanOrEqual(1);

    const musicPlayerMini = screen.getByTestId('music-player-mini');
    expect(musicPlayerMini).toBeTruthy();

    const miniPlayerTrackTitle = await within(musicPlayerMini).findByText(
        new RegExp(`${tracksList[0].title}.*${tracksList[0].artistName}`),
    );
    expect(miniPlayerTrackTitle).toBeTruthy();

    fireEvent.press(miniPlayerTrackTitle);

    const musicPlayerFullScreen = await screen.findByA11yState({
        expanded: true,
    });
    expect(musicPlayerFullScreen).toBeTruthy();

    /**
     * Toggle Devices tab
     * And Search for listed user devices
     */

    const goSettingsButton = within(musicPlayerFullScreen).getByText(
        /Settings/i,
    );
    expect(goSettingsButton).toBeTruthy();
    fireEvent.press(goSettingsButton);

    //Click on change emitting device button
    const displaychangeEmittingDeviceBottomSheetModalButton = await within(
        musicPlayerFullScreen,
    ).findByText(/Change.*emitting.*device/i);
    expect(displaychangeEmittingDeviceBottomSheetModalButton).toBeTruthy();

    fireEvent.press(displaychangeEmittingDeviceBottomSheetModalButton);

    await waitFor(() => {
        const bottomSheetModal = screen.getByTestId(
            'change-emitting-device-bottom-sheet-flat-list',
        );
        expect(bottomSheetModal).toBeTruthy();
    });

    const bottomSheetModal = screen.getByTestId(
        'change-emitting-device-bottom-sheet-flat-list',
    );
    userDevices.forEach((device) => {
        const deviceCardList = within(bottomSheetModal).getByTestId(
            `${device.deviceID}-device-card`,
        );
        expect(deviceCardList).toBeTruthy();

        const isDeviceThisDevice = thisDevice.deviceID === device.deviceID;
        const deviceName = within(deviceCardList).getByText(
            new RegExp(
                `${device.name}.*${isDeviceThisDevice ? '(This device)' : ''}`,
            ),
        );
        expect(deviceName).toBeTruthy();

        const isEmittingDevice =
            state.userRelatedInformation?.emittingDeviceID === device.deviceID;
        if (isEmittingDevice) {
            const emitterIcon = within(deviceCardList).getByA11yLabel(
                `${device.name} is emitting`,
            );
            expect(emitterIcon).toBeTruthy();
        }
    });

    /**
     * Press on a not emitting device
     * It should then become the emitting one
     */

    const lastDevice = userDevices.slice(-1)[0];
    const lastDeviceCardList = within(bottomSheetModal).getByTestId(
        `${lastDevice.deviceID}-device-card`,
    );
    expect(lastDeviceCardList).toBeTruthy();

    fireEvent.press(lastDeviceCardList);

    //Reopening the user devices modal to notify the new emitting one
    fireEvent.press(displaychangeEmittingDeviceBottomSheetModalButton);

    await waitFor(() => {
        const bottomSheetModal = screen.getByTestId(
            'change-emitting-device-bottom-sheet-flat-list',
        );
        const emitterIcon = within(bottomSheetModal).getByA11yLabel(
            `${lastDevice.name} is emitting`,
        );
        expect(emitterIcon).toBeTruthy();
    });
});
