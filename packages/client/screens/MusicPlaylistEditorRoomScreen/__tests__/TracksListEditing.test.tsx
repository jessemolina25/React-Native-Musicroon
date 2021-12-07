import {
    renderApp,
    fireEvent,
    waitFor,
    within,
    waitForElementToBeRemoved,
} from '../../../tests/tests-utils';

function toTrackCardContainerTestID(id: string): string {
    return `${id}-track-card-container`;
}

function extractTrackIDFromCardContainerTestID(testID: string): string {
    return testID.replace('-track-card-container', '');
}

/**
 * Copy-pasted from https://github.com/AdonisEnProvence/MusicRoom/blob/05409fdb003d7060de8a7314a23d923e6704d398/packages/client/screens/MusicPlaylistEditorListScreen/__tests__/CreateMpeRoom.test.tsx.
 */
async function renderMPERoom() {
    const screen = await renderApp();

    expect((await screen.findAllByText(/home/i)).length).toBeGreaterThanOrEqual(
        1,
    );

    const createMpeRoomButton = screen.getByText(/create.*mpe/i);
    expect(createMpeRoomButton).toBeTruthy();

    fireEvent.press(createMpeRoomButton);

    const goToLibraryButton = screen.getByText(/library/i);
    expect(goToLibraryButton).toBeTruthy();

    fireEvent.press(goToLibraryButton);

    await waitFor(() => {
        const [, libraryScreenTitle] = screen.getAllByText(/library/i);
        expect(libraryScreenTitle).toBeTruthy();
    });

    const mpeRoomListItem = await screen.findByText(/^mpe (?<RoomName>.*)$/i);
    expect(mpeRoomListItem).toBeTruthy();

    fireEvent.press(mpeRoomListItem);

    await waitFor(() => {
        const playlistTitle = screen.getByText(/^playlist (?<PlaylistID>.*)$/i);
        expect(playlistTitle).toBeTruthy();
    });

    return screen;
}

test('Add track', async () => {
    const screen = await renderMPERoom();

    const addTrackButton = await screen.findByText(/add.*track/i);
    expect(addTrackButton).toBeTruthy();

    fireEvent.press(addTrackButton);

    await waitFor(() => {
        const trackCardElement = screen.getByTestId(/track-card-container/i);
        expect(trackCardElement).toBeTruthy();
    });

    await waitFor(() => {
        expect(screen.getByText(/add.*track/i)).not.toBeDisabled();
    });
});

test('Move track', async () => {
    const screen = await renderMPERoom();
    let tracksIDs: string[] = [];

    {
        const addTrackButton = await screen.findByText(/add.*track/i);
        expect(addTrackButton).toBeTruthy();

        fireEvent.press(addTrackButton);
    }

    await waitFor(() => {
        const trackCardElement = screen.getByTestId(/track-card-container/i);
        expect(trackCardElement).toBeTruthy();
    });

    {
        const addTrackButton = await waitFor(() => {
            const button = screen.getByText(/add.*track/i);
            expect(button).not.toBeDisabled();

            return button;
        });

        fireEvent.press(addTrackButton);
    }

    {
        /**
         * Ensure two tracks have been added
         */
        const trackCardElements = await waitFor(() => {
            const trackCardElements =
                screen.getAllByTestId(/track-card-container/i);
            expect(trackCardElements.length).toBe(2);

            return trackCardElements;
        });

        await waitFor(() => {
            expect(screen.getByText(/add.*track/i)).not.toBeDisabled();
        });

        tracksIDs = trackCardElements.map(({ props: { testID } }) =>
            extractTrackIDFromCardContainerTestID(testID),
        );

        /**
         * Move down the first track.
         */
        const moveDownFirstTrackButton = within(
            trackCardElements[0],
        ).getByLabelText(/move.*down/i);
        expect(moveDownFirstTrackButton).toBeTruthy();

        fireEvent.press(moveDownFirstTrackButton);
    }

    await waitFor(() => {
        expect(screen.getByText(/add.*track/i)).not.toBeDisabled();
    });

    {
        const trackCardElements =
            screen.getAllByTestId(/track-card-container/i);

        /**
         * Tracks have been swapped
         */
        expect(trackCardElements[0]).toHaveProp(
            'testID',
            toTrackCardContainerTestID(tracksIDs[1]),
        );
        expect(trackCardElements[1]).toHaveProp(
            'testID',
            toTrackCardContainerTestID(tracksIDs[0]),
        );

        /**
         * Move up the last trac.
         */
        const moveUpLastTrackButton = within(
            trackCardElements[1],
        ).getByLabelText(/move.*up/i);
        expect(moveUpLastTrackButton).toBeTruthy();

        fireEvent.press(moveUpLastTrackButton);
    }

    await waitFor(() => {
        expect(screen.getByText(/add.*track/i)).not.toBeDisabled();
    });

    {
        const trackCardElements =
            screen.getAllByTestId(/track-card-container/i);

        /**
         * Tracks have returned their initial position.
         */
        expect(trackCardElements[0]).toHaveProp(
            'testID',
            toTrackCardContainerTestID(tracksIDs[0]),
        );
        expect(trackCardElements[1]).toHaveProp(
            'testID',
            toTrackCardContainerTestID(tracksIDs[1]),
        );
    }
});

test('Remove track', async () => {
    const screen = await renderMPERoom();

    const addTrackButton = await screen.findByText(/add.*track/i);
    expect(addTrackButton).toBeTruthy();

    fireEvent.press(addTrackButton);

    const trackCardElement = await waitFor(() => {
        const trackCardElement = screen.getByTestId(/track-card-container/i);
        expect(trackCardElement).toBeTruthy();

        return trackCardElement;
    });
    const addedTrackID = extractTrackIDFromCardContainerTestID(
        trackCardElement.props.testID,
    );

    await waitFor(() => {
        expect(screen.getByText(/add.*track/i)).not.toBeDisabled();
    });

    const deleteTrackButton =
        within(trackCardElement).getByLabelText(/delete/i);
    expect(deleteTrackButton).toBeTruthy();

    const waitForTrackCardElementToDisappearPromise = waitForElementToBeRemoved(
        () => screen.getByTestId(toTrackCardContainerTestID(addedTrackID)),
    );

    fireEvent.press(deleteTrackButton);

    await waitForTrackCardElementToDisappearPromise;
});
