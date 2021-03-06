import Database from '@ioc:Adonis/Lucid/Database';
import {
    ListMyFollowingRequestBody,
    ListMyFollowingResponseBody,
    UserSummary,
} from '@musicroom/types';
import User from 'App/Models/User';
import { datatype, internet } from 'faker';
import test from 'japa';
import sinon from 'sinon';
import urlcat from 'urlcat';
import {
    generateArray,
    initTestUtils,
    sortBy,
    TEST_MY_PROFILE_ROUTES_GROUP_PREFIX,
} from './utils/TestUtils';

const PAGE_MAX_LENGTH = 10;

test.group('List my following tests group', (group) => {
    const {
        initSocketConnection,
        disconnectEveryRemainingSocketConnection,
        createRequest,
        createUserAndAuthenticate,
    } = initTestUtils();

    group.beforeEach(async () => {
        initSocketConnection();
        await Database.beginGlobalTransaction();
    });

    group.afterEach(async () => {
        await disconnectEveryRemainingSocketConnection();
        sinon.restore();
        await Database.rollbackGlobalTransaction();
    });

    test('It should failed to list my following as I have not confirmed my email', async () => {
        const request = createRequest();

        const emailNotConfirmed = true;
        await createUserAndAuthenticate(request, emailNotConfirmed);

        const body: ListMyFollowingRequestBody = {
            page: 1,
            searchQuery: '',
        };
        await request
            .post(
                urlcat(TEST_MY_PROFILE_ROUTES_GROUP_PREFIX, 'search/following'),
            )
            .send(body)
            .expect(403);
    });

    test('Returns an error when an unauthenticated user tries to get her following list', async () => {
        const request = createRequest();

        const body: ListMyFollowingRequestBody = {
            page: 1,
            searchQuery: '',
        };
        await request
            .post(
                urlcat(TEST_MY_PROFILE_ROUTES_GROUP_PREFIX, 'search/following'),
            )
            .send(body)
            .expect(401);
    });

    test('It should retrieve paginated my following', async (assert) => {
        const request = createRequest();

        const meUser = await createUserAndAuthenticate(request);

        const users = await User.createMany(
            generateArray({
                fill: () => ({
                    uuid: datatype.uuid(),
                    nickname: internet.userName(),
                    email: internet.email(),
                    password: internet.password(),
                }),
                minLength: 22,
                maxLength: 30,
            }),
        );

        //Follow relationship set up
        const followersCounter = datatype.number({
            max: 15,
            min: 11,
        });
        const searchedUserFollowersUserSummary: UserSummary[] = (
            await Promise.all(
                users.map(async (user, index) => {
                    if (index < followersCounter) {
                        await meUser.related('following').save(user);
                        return {
                            userID: user.uuid,
                            nickname: user.nickname,
                        };
                    }

                    return undefined;
                }),
            )
        ).filter(
            (el: UserSummary | undefined): el is UserSummary =>
                el !== undefined,
        );

        const sortedByNicknameSearchedUserFollowersUserSummary: UserSummary[] =
            sortBy(
                searchedUserFollowersUserSummary.map(
                    ({ userID, nickname }) => ({
                        userID,
                        nickname,
                    }),
                ),
                'nickname',
            );
        ///

        const page1RequestBody: ListMyFollowingRequestBody = {
            page: 1,
            searchQuery: '',
        };
        const { body: page1BodyRaw } = await request
            .post(
                urlcat(TEST_MY_PROFILE_ROUTES_GROUP_PREFIX, 'search/following'),
            )
            .send(page1RequestBody)
            .expect('Content-Type', /json/)
            .expect(200);
        const page1BodyParsed = ListMyFollowingResponseBody.parse(page1BodyRaw);
        console.log({ pageBodyParsed: page1BodyParsed });
        assert.equal(page1BodyParsed.page, 1);
        assert.equal(
            page1BodyParsed.totalEntries,
            sortedByNicknameSearchedUserFollowersUserSummary.length,
        );
        assert.isTrue(page1BodyParsed.hasMore);
        assert.equal(page1BodyParsed.data.length, PAGE_MAX_LENGTH);
        assert.deepEqual(
            page1BodyParsed.data,
            sortedByNicknameSearchedUserFollowersUserSummary.slice(
                0,
                PAGE_MAX_LENGTH,
            ),
        );

        const page2RequestBody: ListMyFollowingRequestBody = {
            page: 2,
            searchQuery: '',
        };
        const { body: page2BodyRaw } = await request
            .post(
                urlcat(TEST_MY_PROFILE_ROUTES_GROUP_PREFIX, 'search/following'),
            )
            .send(page2RequestBody)
            .expect('Content-Type', /json/)
            .expect(200);
        const page2BodyParsed = ListMyFollowingResponseBody.parse(page2BodyRaw);
        console.log({ pageBodyParsed: page2BodyParsed });
        assert.equal(page2BodyParsed.page, 2);
        assert.equal(
            page2BodyParsed.totalEntries,
            sortedByNicknameSearchedUserFollowersUserSummary.length,
        );
        assert.isFalse(page2BodyParsed.hasMore);
        assert.equal(
            page2BodyParsed.data.length,
            sortedByNicknameSearchedUserFollowersUserSummary.length -
                PAGE_MAX_LENGTH,
        );
        assert.deepEqual(
            page2BodyParsed.data,
            sortedByNicknameSearchedUserFollowersUserSummary.slice(
                PAGE_MAX_LENGTH,
                PAGE_MAX_LENGTH * 2,
            ),
        );
    });

    test('Filters my following list by a search query', async (assert) => {
        const request = createRequest();

        const meUser = await createUserAndAuthenticate(request);

        const searchQuery = 'Biolay';
        const users = await User.createMany(
            generateArray({
                fill: (index) => ({
                    uuid: datatype.uuid(),
                    nickname: `${
                        index % 2 === 0 ? searchQuery : ''
                    }${internet.userName()}`,
                    email: internet.email(),
                    password: internet.password(),
                }),
                minLength: 20,
                maxLength: 20,
            }),
        );

        //Follow relationship set up
        const followersCounter = datatype.number({
            max: 10,
            min: 8,
        });
        const searchedUserFollowersUserSummary: UserSummary[] = (
            await Promise.all(
                users.map(async (user, index) => {
                    if (index < followersCounter) {
                        await meUser.related('following').save(user);
                        return {
                            userID: user.uuid,
                            nickname: user.nickname,
                        };
                    }

                    return undefined;
                }),
            )
        ).filter(
            (el: UserSummary | undefined): el is UserSummary =>
                el !== undefined,
        );
        ///

        //filtering options
        const matchingSearchQuerySortedByNicknameSearchedUserFollowers =
            searchedUserFollowersUserSummary
                .filter((user) =>
                    user.nickname
                        .toLowerCase()
                        .startsWith(searchQuery.toLowerCase()),
                )
                //see https://jiangsc.me/2021/05/09/Postgres-JavaScript-and-sorting/
                .sort((a, b) => a.nickname.localeCompare(b.nickname));
        ///

        const pageRequestBody: ListMyFollowingRequestBody = {
            page: 1,
            searchQuery,
        };
        const { body: pageBodyRaw } = await request
            .post(
                urlcat(TEST_MY_PROFILE_ROUTES_GROUP_PREFIX, 'search/following'),
            )
            .send(pageRequestBody)
            .expect('Content-Type', /json/)
            .expect(200);

        const pageBodyParsed = ListMyFollowingResponseBody.parse(pageBodyRaw);

        assert.equal(pageBodyParsed.page, 1);
        assert.equal(
            pageBodyParsed.totalEntries,
            matchingSearchQuerySortedByNicknameSearchedUserFollowers.length,
        );
        assert.isFalse(pageBodyParsed.hasMore);
        assert.equal(
            pageBodyParsed.data.length,
            matchingSearchQuerySortedByNicknameSearchedUserFollowers.length,
        );
        const expectedData =
            matchingSearchQuerySortedByNicknameSearchedUserFollowers.slice(
                0,
                PAGE_MAX_LENGTH,
            );
        console.log('ACTUAL', pageBodyParsed.data);
        console.log('EXPECTED', expectedData);
        assert.deepEqual(pageBodyParsed.data, expectedData);
    });
});
