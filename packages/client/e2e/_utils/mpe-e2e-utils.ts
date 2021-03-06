import { MpeChangeTrackOrderOperationToApply } from '@musicroom/types';
import { expect, Page, Locator } from '@playwright/test';
import { random } from 'faker';
import { assertIsNotNull } from '../_utils/assert';
import { hitGoNextButton } from '../_utils/global';
import {
    KnownSearchesElement,
    KnownSearchesRecord,
    knownSearchesRecordKey,
} from '../_utils/mock-http';

export const knownSearches: KnownSearchesRecord = {
    'Biolay - Vendredi 12': [
        {
            id: 'eD-ORVUQ-pw',
            title: 'Benjamin Biolay - Vendredi 12 (Clip Officiel)',
            artistName: 'BenjaminBiolayVEVO',
            duration: 0,
        },
        {
            id: 'H8GDdTX8Cww',
            title: 'Vendredi 12',
            artistName: 'Benjamin Biolay - Topic',
            duration: 0,
        },
        {
            id: '7aW8iGoqi1o',
            title: 'Benjamin Biolay - Vendredi 12',
            artistName: 'Bruno Gaillardo',
            duration: 0,
        },
        {
            id: 'O8HyyYxbznQ',
            title: 'Vendredi 12 - Benjamin Biolay (reprise)',
            artistName: 'Clémence Bnt',
            duration: 0,
        },
        {
            id: 'LZ6EkzDQbiY',
            title: 'Benjamin Biolay - Où est passée la tendresse (Live) - Le Grand Studio RTL',
            artistName: 'Le Grand Studio RTL',
            duration: 0,
        },
    ],

    'BB Brunes': [
        {
            id: 'X3VNRVo7irM',
            title: 'BB BRUNES - Dis-Moi [Clip Officiel]',
            artistName: 'BBBrunesMusic',
            duration: 0,
        },
        {
            id: 'mF5etHMRMMM',
            title: 'BB BRUNES - Coups et Blessures [Clip Officiel]',
            artistName: 'BBBrunesMusic',
            duration: 0,
        },
        {
            id: '1d3etBBSSfw',
            title: 'BB BRUNES - Lalalove You [Clip Officiel]',
            artistName: 'BBBrunesMusic',
            duration: 0,
        },
        {
            id: 'DyRDeEWhW6M',
            title: 'BB BRUNES - Aficionado [Clip Officiel]',
            artistName: 'BBBrunesMusic',
            duration: 0,
        },
        {
            id: 'Qs-ucIS2B-0',
            title: 'BB BRUNES - Stéréo [Clip Officiel]',
            artistName: 'BBBrunesMusic',
            duration: 0,
        },
    ],

    Madeleine: [
        {
            id: 'g8bS50c8v2s',
            title: 'Jacques Brel Madeleine 1962',
            artistName: 'Anastasio Eric',
            duration: 0,
        },
        {
            id: 'I7E1TV9giy4',
            title: 'Omido - Madeleine (Lyrics) ft. Rick Jansen',
            artistName: 'Cakes & Eclairs',
            duration: 0,
        },
        {
            id: 'RpJ-2U707pg',
            title: 'Michael Phantom - Madeleine (Official Music Video) || VIEWS ||',
            artistName: 'VIEWS',
            duration: 0,
        },
        {
            id: 'bdLHTAaMNdg',
            title: 'Madeleine',
            artistName: 'Jacques Brel - Topic',
            duration: 0,
        },
        {
            id: 'B49mIKWXc_8',
            title: 'Madeleine - Ça va passer [CLIP OFFICIEL]',
            artistName: 'itsmadeleine. love',
            duration: 0,
        },
    ],
};

export async function pressMpeRoomInvitationToast({
    page,
    invitingUserName,
    roomName,
}: {
    page: Page;
    invitingUserName: string;
    roomName: string;
}): Promise<void> {
    const invitationToast = page.locator(
        `text="${invitingUserName} sent you an invitation"`,
    );
    await expect(invitationToast).toBeVisible();

    await invitationToast.click();

    await expect(page.locator(`text="Playlist ${roomName}"`)).toBeVisible();
}

export function withinMpeRoomsLibraryScreen(selector: string): string {
    return `css=[data-testid="library-mpe-rooms-list"] >> ${selector}`;
}

export function withinSignUpFormScreenContainer(selector: string): string {
    return `css=[data-testid="sign-up-form-screen-container"] >> ${selector}`;
}

export function withinSignInFormScreenContainer(selector: string): string {
    return `css=[data-testid="sign-in-screen-container"] >> ${selector}`;
}

export function withinMpeRoomScreen(selector: string): string {
    return `css=[data-testid^="mpe-room-screen-"] >> ${selector}`;
}

export function withinMusicPlayerFullscreenContainer(selector: string): string {
    return `css=[data-testid="music-player-fullscreen-container"] >> ${selector}`;
}

export function withinMpeRoomsSearchEngineScreen(selector: string): string {
    return `css=[data-testid="mpe-room-search-engine"] >> ${selector}`;
}

export function withinSearchTrackTabScreen(selector: string): string {
    return `css=[data-testid="search-track-screen"] >> ${selector}`;
}

export function withinPlaylistsVisibilityContainer(selector: string): string {
    return `css=[data-testid="playlists-visibility-radio-group"] >> ${selector}`;
}

export function withinRelationsVisibilityContainer(selector: string): string {
    return `css=[data-testid="relations-visibility-radio-group"] >> ${selector}`;
}

export function withinMyProfilePageContainer(selector: string): string {
    return `css=[data-testid="my-profile-settings-page-container"] >> ${selector}`;
}

export function withinEmailConfirmationScreenContainer(
    selector: string,
): string {
    return `css=[data-testid="email-confirmation-screen-container"] >> ${selector}`;
}

export function withinUserProfileScreen({
    page,
    userID,
}: {
    page: Page;
    userID: string;
}): Locator {
    return page.locator(`css=[data-testid="${userID}-profile-page-screen"]`);
}

export function withinMyUserProfilePageContainer({
    selector,
    userID,
}: {
    selector: string;
    userID: string;
}): string {
    return `css=[data-testid="${userID}-profile-page-screen"] >> ${selector}`;
}

export function withinEditMyNicknameContainer(selector: string): string {
    return `css=[data-testid="update-nickname-screen"] >> ${selector}`;
}

function withinAsideMenu(selector: string): string {
    return `css=[data-testid="aside-menu"] >> visible=true >> ${selector}`;
}

export function getAppHomeButtonLocator(): string {
    return withinAsideMenu('text="Home"');
}

export function getAppSearchButtonLocator(): string {
    return withinAsideMenu('text="Search"');
}

export function getAppLibraryButtonLocator(): string {
    return withinAsideMenu('text="Library"');
}

export async function createMpeRoom({
    page,
}: {
    page: Page;
}): Promise<{ roomName: string }> {
    await expect(page.locator(getAppHomeButtonLocator())).toBeVisible();

    const goToTracksSearch = page.locator(getAppSearchButtonLocator());
    await goToTracksSearch.click();

    const trackQuery = 'Biolay - Vendredi 12';
    await page.fill(
        'css=[placeholder*="Search a track"] >> visible=true',
        trackQuery,
    );
    await page.keyboard.press('Enter');

    const firstMatchingSong = page
        .locator(`text=${knownSearches[trackQuery][0].title}`)
        .first();
    await expect(firstMatchingSong).toBeVisible();

    const selectedSongTitle = await firstMatchingSong.textContent();
    assertIsNotNull(
        selectedSongTitle,
        'The selected song must exist and have a text content',
    );

    await firstMatchingSong.click();

    const createMpeRoomModalButton = page.locator('text="Create MPE"');
    await createMpeRoomModalButton.click();

    await expect(
        page.locator('text="What is the name of the room?"'),
    ).toBeVisible();

    const roomName = random.words();
    await page.fill('css=[placeholder="Playlist name"]', roomName);

    await hitGoNextButton({
        page,
    });

    await expect(
        page.locator('text="What is the opening status of the room?"'),
    ).toBeVisible();

    const publicMode = page.locator(
        'css=[aria-selected="true"] >> text="Public"',
    );
    await expect(publicMode).toBeVisible();
    await hitGoNextButton({
        page,
    });

    await expect(page.locator('text="Confirm room creation"')).toBeVisible();
    const elementWithSelectedSongTitle = page.locator(
        `text=${selectedSongTitle}`,
    );
    await expect(elementWithSelectedSongTitle).toBeVisible();
    await hitGoNextButton({
        page,
    });

    return {
        roomName,
    };
}

export async function checkUsersLength({
    page,
    expectedUsersLength,
}: {
    page: Page;
    expectedUsersLength: number;
}): Promise<void> {
    const userCounter = page.locator(
        `text="${expectedUsersLength} member${
            expectedUsersLength > 1 ? 's' : ''
        }"`,
    );
    await expect(userCounter).toBeVisible();
}

export async function goToLibraryAndSearchMpeRoomAndOpenIt({
    page,
    roomName,
}: {
    page: Page;
    roomName: string;
}): Promise<void> {
    const goToLibraryButton = page.locator('text="Library" >> nth=0');
    await goToLibraryButton.click();

    const libraryScreenTitle = page.locator(
        withinMpeRoomsLibraryScreen('text="Your library"'),
    );
    await expect(libraryScreenTitle).toBeVisible();

    const mpeRoomCard = page.locator(
        withinMpeRoomsLibraryScreen(`text="${roomName}"`),
    );
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const roomHasBeenFound = await mpeRoomCard.isVisible();
        if (roomHasBeenFound === true) {
            break;
        }

        //This is tmp as the mpe room search machine is broken and only refresh on cancel
        const searchRoomInput = page.locator(
            withinMpeRoomsLibraryScreen('css=[placeholder^="Search a room"]'),
        );
        await searchRoomInput.click();

        const cancelSearchRoomButton = page.locator(
            withinMpeRoomsLibraryScreen('text="Cancel"'),
        );
        await cancelSearchRoomButton.click();
    }

    await mpeRoomCard.click();

    const addTrackButton = getAddTrackButton({
        page,
    });
    await expect(addTrackButton).toBeVisible();
    await expect(addTrackButton).toBeEnabled();
}

/**
 * every given page should on home either page or otherUserDevicesToApplyAssertionOn
 */
export async function searchAndJoinMpeRoomFromMpeRoomsSearchEngine({
    page,
    roomName,
    otherUserDevicesToApplyAssertionOn,
}: {
    page: Page;
    roomName: string;
    otherUserDevicesToApplyAssertionOn?: Page[];
}): Promise<void> {
    const goToMusicPlaylistEditorButton = page.locator(
        `css=[data-testid="home-screen-mpe-group"] >> text="Join a room"`,
    );
    await expect(goToMusicPlaylistEditorButton).toBeVisible();
    await expect(goToMusicPlaylistEditorButton).toBeEnabled();
    await goToMusicPlaylistEditorButton.click();

    const mpeRoomCard = page.locator(
        withinMpeRoomsSearchEngineScreen(`text="${roomName}"`),
    );
    // eslint-disable-next-line no-constant-condition
    await expect(mpeRoomCard).toBeVisible();
    await expect(mpeRoomCard).toBeEnabled();
    await mpeRoomCard.click();

    const joinRoomButton = page.locator(`text="JOIN"`);
    await expect(joinRoomButton).toBeVisible();
    await expect(joinRoomButton).toBeEnabled();

    await joinRoomButton.click();

    // This is useless
    await expect(
        getAddTrackButton({
            page,
        }),
    ).toBeEnabled();

    if (otherUserDevicesToApplyAssertionOn) {
        await Promise.all(
            otherUserDevicesToApplyAssertionOn.map(async (otherUserPage) => {
                const goToLibraryButton = otherUserPage.locator(
                    'text="Library" >> nth=0',
                );
                await goToLibraryButton.click();

                const libraryScreenTitle = otherUserPage.locator(
                    withinMpeRoomsLibraryScreen('text="Your library"'),
                );
                await expect(libraryScreenTitle).toBeVisible();

                const mpeRoomCard = otherUserPage.locator(
                    withinMpeRoomsLibraryScreen(`text="${roomName}"`),
                );
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const roomHasBeenFound = await mpeRoomCard.isVisible();
                    if (roomHasBeenFound === true) {
                        break;
                    }

                    //This is tmp as the mpe room search machine is broken and only refresh on cancel
                    const searchRoomInput = otherUserPage.locator(
                        withinMpeRoomsLibraryScreen(
                            'css=[placeholder^="Search a room"]',
                        ),
                    );
                    await searchRoomInput.click();

                    const cancelSearchRoomButton = otherUserPage.locator(
                        withinMpeRoomsLibraryScreen('text="Cancel"'),
                    );
                    await cancelSearchRoomButton.click();
                }
            }),
        );
    }
}

export async function openMpeSettingsModal({
    page,
}: {
    page: Page;
}): Promise<void> {
    const openSettingsButton = page.locator(
        `css=[data-testid="mpe-open-settings"]:not([aria-disabled="true"])`,
    );
    await expect(openSettingsButton).toBeVisible();
    await expect(openSettingsButton).not.toHaveAttribute(
        'aria-disabled',
        'true',
        {
            timeout: 10_000,
        },
    );

    await openSettingsButton.click();

    const exportButton = page.locator(
        `css=[data-testid="export-mpe-to-mtv-button"]`,
    );
    await expect(exportButton).toBeVisible({ timeout: 30_000 });
    const leaveRoomButton = page.locator(
        `css=[data-testid="leave-mpe-room-button"]`,
    );
    await expect(leaveRoomButton).toBeVisible();
}

/**
 * Should be called from related mpe room view
 * It then involves a redirection
 * forcedDisconnectedPages should never contains a leaving user page
 */

interface NotRedirectedPage {
    page: Page;
    //Should assertion takes a page ? it could avoid future dev errors
    assertion: () => Promise<void>;
}
export async function leaveMpeRoom({
    leavingPage,
    roomName,
    forcedDisconnectedRedirectedOtherUsersPages = [],
    forcedDisconnectedNotRedirectedOtherUsersPages = [],
    redirectedLeavingUserPages = [],
    notRedirectedLeavingUserPages = [],
}: {
    leavingPage: Page;
    roomName: string;
    forcedDisconnectedRedirectedOtherUsersPages?: Page[];
    forcedDisconnectedNotRedirectedOtherUsersPages?: NotRedirectedPage[];
    redirectedLeavingUserPages?: Page[];
    notRedirectedLeavingUserPages?: NotRedirectedPage[];
}): Promise<void> {
    //In our testing leave method, leaving page is always redirected
    const redirectedLeavingUserPagesWithLeavingPage = [
        leavingPage,
        ...redirectedLeavingUserPages,
    ];

    //Expecting leave toast on every leaving user pages
    const allLeavingUserPages: Page[] = [
        ...redirectedLeavingUserPagesWithLeavingPage,
        ...notRedirectedLeavingUserPages.map((el) => el.page),
    ];

    const allForcedDisconnectedPages: Page[] = [
        ...forcedDisconnectedRedirectedOtherUsersPages,
        ...forcedDisconnectedNotRedirectedOtherUsersPages.map((el) => el.page),
    ];

    await openMpeSettingsModal({
        page: leavingPage,
    });

    const leaveButton = leavingPage.locator(`text="Leave room"`);
    await expect(leaveButton).toBeVisible();
    await expect(leaveButton).toBeEnabled();

    await Promise.all([
        Promise.all(
            allLeavingUserPages.map<Promise<Locator>>(async (userPage) =>
                expect(
                    userPage.locator(`text="Leaving ${roomName} is a success"`),
                ).toBeVisible(),
            ),
        ),
        Promise.all(
            allForcedDisconnectedPages.map<Promise<Locator>>(
                async (forcedDisconnectedPage) =>
                    expect(
                        forcedDisconnectedPage.locator(
                            `text="${roomName} creator has quit"`,
                        ),
                    ).toBeVisible(),
            ),
        ),
        leaveButton.click(),
    ]);

    //After a leaving every page currently looking to the leaved mpe room will be redirected to the library
    const allredirectedPages: Page[] = [
        ...redirectedLeavingUserPagesWithLeavingPage,
        ...forcedDisconnectedRedirectedOtherUsersPages,
    ];
    await Promise.all(
        allredirectedPages.map(async (redirectedPage) =>
            expect(
                redirectedPage.locator(
                    withinMpeRoomsLibraryScreen('text="Your library"'),
                ),
            ).toBeVisible(),
        ),
    );

    //Custom assertions for others leaving user pages that are everywhere but in the leaved mpe room view
    const allNotRedirectedPages: NotRedirectedPage[] = [
        ...notRedirectedLeavingUserPages,
        ...forcedDisconnectedNotRedirectedOtherUsersPages,
    ];
    await Promise.all(
        allNotRedirectedPages.map(async ({ assertion }) => await assertion()),
    );
}

export async function pageIsOnHomeScreen({
    page,
    timeout,
}: {
    page: Page;
    timeout?: number;
}): Promise<void> {
    await expect(
        page.locator('css=[data-testid="home-screen-container"]'),
    ).toBeVisible({
        timeout,
    });
}

export async function pageIsOnSignInScreen({
    page,
}: {
    page: Page;
}): Promise<void> {
    await expect(
        page.locator('css=[data-testid="sign-in-screen-container"]'),
    ).toBeVisible();
}

export async function pageIsOnMyProfileScreen({
    page,
}: {
    page: Page;
}): Promise<void> {
    await expect(
        page.locator(`css=[data-testid="my-profile-page-container"]`).last(),
    ).toBeVisible();
}

export async function pageIsOnMyProfileSettingsScreen({
    page,
}: {
    page: Page;
}): Promise<void> {
    await expect(
        page.locator(`css=[data-testid="my-profile-settings-page-container"]`),
    ).toBeVisible();
}

export async function pageIsOnEditMyNicknameScreen({
    page,
}: {
    page: Page;
}): Promise<void> {
    await expect(
        page.locator(`css=[data-testid="update-nickname-screen"]`),
    ).toBeVisible();
}

export async function pageIsOnSearchTrackScreen({
    page,
}: {
    page: Page;
}): Promise<void> {
    const searchTrackScreenTitle = page.locator(
        withinSearchTrackTabScreen('text="Search a track"'),
    );
    await expect(searchTrackScreenTitle).toBeVisible();
}

export async function pageIsOnEmailConfirmationScreen({
    page,
}: {
    page: Page;
}): Promise<void> {
    await expect(
        page.locator(`css=[data-testid="email-confirmation-screen-container"]`),
    ).toBeVisible();
}

export async function goToMyProfileFromHomeTab({
    page,
}: {
    page: Page;
}): Promise<void> {
    await pageIsOnHomeScreen({
        page,
    });

    const myProfileIcon = page
        .locator(`css=[data-testid="open-my-profile-page-button"]`)
        .last();
    await expect(myProfileIcon).toBeVisible();

    await myProfileIcon.click();

    await pageIsOnMyProfileScreen({
        page,
    });
}

export async function goToMyProfileSettingsFromMyProfileScreen({
    page,
}: {
    page: Page;
}): Promise<void> {
    await pageIsOnMyProfileScreen({
        page,
    });

    const mySettingsButton = page
        .locator(`css=[aria-label="Open my settings screen"]`)
        .last();
    await expect(mySettingsButton).toBeVisible();

    await mySettingsButton.click();

    await pageIsOnMyProfileSettingsScreen({
        page,
    });
}

export async function goToEditMyNicknameFromMyProfileScreen({
    page,
    userNickname,
}: {
    page: Page;
    userNickname: string;
}): Promise<void> {
    const goToEditNickName = page
        .locator(withinMyProfilePageContainer(`text="${userNickname}"`))
        .last();
    await expect(goToEditNickName).toBeVisible();

    await goToEditNickName.click();

    await pageIsOnEditMyNicknameScreen({
        page,
    });
}

export async function goToHomeTabScreen({
    page,
}: {
    page: Page;
}): Promise<void> {
    const homeBottomBar = page.locator(getAppHomeButtonLocator());
    await expect(homeBottomBar).toBeVisible();

    await homeBottomBar.click();

    await pageIsOnHomeScreen({
        page,
    });
}

export async function hitGoBack({
    page,
    afterGoBackAssertion,
}: {
    page: Page;
    afterGoBackAssertion: () => Promise<void>;
}): Promise<void> {
    const goBackButton = page
        .locator('css=[aria-label="Go back"] >> visible=true')
        .last();
    await expect(goBackButton).toBeVisible();
    await expect(goBackButton).toBeEnabled();

    await goBackButton.click();

    await afterGoBackAssertion();
}

export async function addTrack({
    page,
    searchQuery,
}: {
    page: Page;
    searchQuery: knownSearchesRecordKey;
}): Promise<KnownSearchesElement> {
    const addTrackButton = getAddTrackButton({
        page,
    });
    await expect(addTrackButton).toBeVisible();

    await addTrackButton.click();

    const searchTrackInput = page.locator(
        'css=[placeholder*="Search a track"] >> visible=true',
    );
    await searchTrackInput.fill(searchQuery);
    await page.keyboard.press('Enter');

    const trackToAdd = knownSearches[searchQuery][0];
    const trackToAddTitle = trackToAdd.title;
    const trackToAddCard = page
        .locator(`text=${trackToAddTitle} >> visible=true`)
        .first();
    await trackToAddCard.click();

    const addedTrackTestID = `mpe-${trackToAdd.id}-track-card-container`;
    const addedTrackCardOnRoomScreen = page.locator(
        `css=[data-testid="${addedTrackTestID}"]`,
    );
    await expect(addedTrackCardOnRoomScreen).toBeVisible({
        timeout: 10_000,
    });

    return trackToAdd;
}

export async function waitForTrackToBeAddedOnRoomScreen({
    page,
    addedTrackTitle,
}: {
    page: Page;
    addedTrackTitle: string;
}): Promise<void> {
    await expect(
        page.locator(withinMpeRoomScreen(`text=${addedTrackTitle}`)),
    ).toBeVisible();
}

export function getTrackChangeOrderButton({
    page,
    trackIDToMove,
    operationToApply,
}: {
    page: Page;
    trackIDToMove: string;
    operationToApply: MpeChangeTrackOrderOperationToApply;
}): Locator {
    return page.locator(
        withinMpeRoomScreen(
            `css=[data-testid="mpe-${trackIDToMove}-track-card-container"] [aria-label="Move ${
                operationToApply === 'DOWN' ? 'down' : 'up'
            }"]`,
        ),
    );
}

export function getTrackDeleteButton({
    page,
    trackID,
}: {
    page: Page;
    trackID: string;
}): Locator {
    return page.locator(
        withinMpeRoomScreen(
            `css=[data-testid="mpe-${trackID}-track-card-container"] [aria-label="Delete"]`,
        ),
    );
}

export function getAddTrackButton({ page }: { page: Page }): Locator {
    return page.locator(`css=[data-testid="mpe-add-track-button"]`).last();
}

export function getAllTracksListCardElements({
    page,
}: {
    page: Page;
}): Locator {
    return page.locator(
        withinMpeRoomScreen(`css=[data-testid$="track-card-container"]`),
    );
}

export async function changeTrackOrder({
    page,
    trackIDToMove,
    operationToApply,
    trackTitle,
    deviceToApplyAssertionOn,
}: {
    page: Page;
    trackIDToMove: string;
    trackTitle: string;
    operationToApply: MpeChangeTrackOrderOperationToApply;
    deviceToApplyAssertionOn: Page[];
}): Promise<void> {
    const trackToMoveChangeOrderButton = getTrackChangeOrderButton({
        page,
        trackIDToMove,
        operationToApply,
    });
    await expect(trackToMoveChangeOrderButton).toBeVisible();
    await expect(trackToMoveChangeOrderButton).not.toHaveAttribute(
        'aria-disabled',
        'true',
    );

    await Promise.all([
        expect(page.locator('text=Track moved successfully')).toBeVisible(),
        trackToMoveChangeOrderButton.click(),
    ]);

    await Promise.all(
        [page, ...deviceToApplyAssertionOn].map(async (page) => {
            const firstTracksListElement = page.locator(
                withinMpeRoomScreen(
                    'css=[data-testid$="track-card-container"] >> nth=0',
                ),
            );
            await expect(firstTracksListElement).toContainText(trackTitle);
        }),
    );
}

export async function deleteTrack({
    page,
    trackID,
    deviceToApplyAssertionOn,
}: {
    trackID: string;
    page: Page;
    deviceToApplyAssertionOn: Page[];
}): Promise<void> {
    const trackDeleteButton = getTrackDeleteButton({
        page,
        trackID,
    });
    await expect(trackDeleteButton).toBeVisible();
    await expect(trackDeleteButton).toBeEnabled();

    await trackDeleteButton.click();

    {
        const successfulToast = page.locator('text=Track deleted successfully');
        await expect(successfulToast).toBeVisible();

        await Promise.all(
            [page, ...deviceToApplyAssertionOn].map(async (page) => {
                const deleteButton = getTrackDeleteButton({
                    page,
                    trackID,
                });
                await expect(deleteButton).not.toBeVisible();

                const allTracks = getAllTracksListCardElements({
                    page,
                });
                await expect(allTracks).toHaveCount(1);
            }),
        );
    }
}
