import { internet } from 'faker';
import { db } from '../../../tests/data';
import {
    fireEvent,
    renderApp,
    CLIENT_INTEG_TEST_USER_ID,
    waitFor,
} from '../../../tests/tests-utils';

test('It should display my profile page with my profile information', async () => {
    const userID = CLIENT_INTEG_TEST_USER_ID;

    db.myProfileInformation.create({
        userID,
        devicesCounter: 3,
        playlistsCounter: 4,
        followersCounter: 5,
        followingCounter: 6,
        userNickname: internet.userName(),
        hasConfirmedEmail: true,
    });

    const screen = await renderApp();

    expect(screen.getAllByText(/home/i).length).toBeGreaterThanOrEqual(1);

    const myProfileButton = screen.getByTestId('open-my-profile-page-button');
    expect(myProfileButton).toBeTruthy();

    fireEvent.press(myProfileButton);

    await waitFor(() => {
        expect(screen.getByTestId('my-profile-page-container')).toBeTruthy();

        const devicesCounter = screen.getByTestId(/my-profile-devices-3/i);
        expect(devicesCounter).toBeTruthy();

        const playlistsCounter = screen.getByTestId(/my-profile-playlists-4/i);
        expect(playlistsCounter).toBeTruthy();

        const followersCounter = screen.getByTestId(/my-profile-followers-5/i);
        expect(followersCounter).toBeTruthy();

        const followingCounter = screen.getByTestId(/my-profile-following-6/i);
        expect(followingCounter).toBeTruthy();

        const avatar = screen.getByLabelText(/my.*avatar/i);
        expect(avatar).toBeTruthy();
    });
});

test('It should display my library after pressing playlists counter', async () => {
    const userID = CLIENT_INTEG_TEST_USER_ID;

    db.myProfileInformation.create({
        userID,
        devicesCounter: 3,
        playlistsCounter: 4,
        followersCounter: 5,
        followingCounter: 6,
        userNickname: internet.userName(),
        hasConfirmedEmail: true,
    });

    const screen = await renderApp();

    expect(screen.getAllByText(/home/i).length).toBeGreaterThanOrEqual(1);

    const myProfileButton = screen.getByTestId('open-my-profile-page-button');
    expect(myProfileButton).toBeTruthy();

    fireEvent.press(myProfileButton);

    const playlistsCounter = await waitFor(() => {
        expect(screen.getByTestId('my-profile-page-container')).toBeTruthy();

        const devicesCounter = screen.getByTestId(/my-profile-devices-3/i);
        expect(devicesCounter).toBeTruthy();

        const playlistsCounter = screen.getByTestId(/my-profile-playlists-4/i);
        expect(playlistsCounter).toBeTruthy();

        const followersCounter = screen.getByTestId(/my-profile-followers-5/i);
        expect(followersCounter).toBeTruthy();

        const followingCounter = screen.getByTestId(/my-profile-following-6/i);
        expect(followingCounter).toBeTruthy();

        const avatar = screen.getByLabelText(/my.*avatar/i);
        expect(avatar).toBeTruthy();

        return playlistsCounter;
    });

    expect(playlistsCounter).toBeTruthy();

    fireEvent.press(playlistsCounter);

    await waitFor(() => {
        expect(screen.getByTestId('library-mpe-rooms-list')).toBeTruthy();
        expect(screen.queryByTestId('my-profile-page-container')).toBeNull();
    });
});
