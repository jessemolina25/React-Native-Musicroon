import Database from '@ioc:Adonis/Lucid/Database';
import {
    MtvRoomSearchRequestBody,
    MtvRoomSearchResponse,
} from '@musicroom/types';
import test from 'japa';
import supertest from 'supertest';
import { random, datatype, internet } from 'faker';
import MtvRoom from 'App/Models/MtvRoom';
import { BASE_URL } from './utils/TestUtils';
import User from 'App/Models/User';

function generateArray<Item>(length: number, fill: () => Item): Item[] {
    return Array.from({ length }).map(() => fill());
}

test.group('MtvRoom Search Engine', (group) => {
    group.beforeEach(async () => {
        await Database.beginGlobalTransaction();
    });

    group.afterEach(async () => {
        await Database.rollbackGlobalTransaction();
    });

    test('Page must be strictly positive', async () => {
        await supertest(BASE_URL)
            .post('/search/rooms')
            .send({
                page: 0,
                searchQuery: '',
            } as MtvRoomSearchRequestBody)
            .expect(500);
    });

    test('Rooms are paginated', async (assert) => {
        const PAGE_MAX_LENGTH = 10;
        const creator = await User.create({
            uuid: datatype.uuid(),
            nickname: internet.userName(),
        });
        const roomsCount = datatype.number({
            min: 11,
            max: 15,
        });
        await MtvRoom.createMany(
            generateArray(roomsCount, () => ({
                uuid: datatype.uuid(),
                runID: datatype.uuid(),
                name: random.words(2),
                creatorID: creator.uuid,
                isOpen: datatype.boolean(),
            })),
        );

        const { body: firstPageBodyRaw } = await supertest(BASE_URL)
            .post('/search/rooms')
            .send({
                page: 1,
                searchQuery: '',
            } as MtvRoomSearchRequestBody)
            .expect('Content-Type', /json/)
            .expect(200);
        const firstPageBodyParsed =
            MtvRoomSearchResponse.parse(firstPageBodyRaw);
        assert.isTrue(firstPageBodyParsed.hasMore);
        assert.equal(firstPageBodyParsed.page, 1);
        assert.equal(firstPageBodyParsed.totalEntries, roomsCount);
        assert.equal(firstPageBodyParsed.data.length, PAGE_MAX_LENGTH);

        const { body: secondPageBodyRaw } = await supertest(BASE_URL)
            .post('/search/rooms')
            .send({
                page: 2,
                searchQuery: '',
            } as MtvRoomSearchRequestBody)
            .expect('Content-Type', /json/)
            .expect(200);
        const secondPageBodyParsed =
            MtvRoomSearchResponse.parse(secondPageBodyRaw);
        assert.isFalse(secondPageBodyParsed.hasMore);
        assert.equal(secondPageBodyParsed.page, 2);
        assert.equal(secondPageBodyParsed.totalEntries, roomsCount);
        assert.equal(
            secondPageBodyParsed.data.length,
            roomsCount % PAGE_MAX_LENGTH,
        );
    });

    test('Rooms are paginated and filtered', async (assert) => {
        const creator = await User.create({
            uuid: datatype.uuid(),
            nickname: internet.userName(),
        });
        const rooms = await MtvRoom.createMany(
            generateArray(
                datatype.number({
                    min: 10,
                    max: 15,
                }),
                () => ({
                    uuid: datatype.uuid(),
                    runID: datatype.uuid(),
                    name: random.words(2),
                    creatorID: creator.uuid,
                    isOpen: datatype.boolean(),
                }),
            ),
        );
        const firstRoomNameFirstCharacter = rooms[0].name.charAt(0);
        const roomsWithNameFirstCharacterEqualToFirstRoom = rooms.filter(
            ({ name }) => name.charAt(0) === firstRoomNameFirstCharacter,
        );
        const roomsCount = roomsWithNameFirstCharacterEqualToFirstRoom.length;

        const { body: pageBodyRaw } = await supertest(BASE_URL)
            .post('/search/rooms')
            .send({
                page: 1,
                searchQuery: firstRoomNameFirstCharacter,
            } as MtvRoomSearchRequestBody)
            .expect('Content-Type', /json/)
            .expect(200);
        const pageBodyParsed = MtvRoomSearchResponse.parse(pageBodyRaw);
        assert.equal(pageBodyParsed.page, 1);
        assert.equal(pageBodyParsed.totalEntries, roomsCount);
        assert.equal(pageBodyParsed.data.length, roomsCount);
    });

    test('Returns empty data if page is out of bound', async (assert) => {
        const PAGE_OUT_OF_BOUND = 100;
        const creator = await User.create({
            uuid: datatype.uuid(),
            nickname: internet.userName(),
        });
        await MtvRoom.create({
            uuid: datatype.uuid(),
            runID: datatype.uuid(),
            name: random.words(2),
            creatorID: creator.uuid,
            isOpen: datatype.boolean(),
        });

        const { body: pageBodyRaw } = await supertest(BASE_URL)
            .post('/search/rooms')
            .send({
                page: PAGE_OUT_OF_BOUND,
                searchQuery: '',
            } as MtvRoomSearchRequestBody)
            .expect('Content-Type', /json/)
            .expect(200);
        const pageBodyParsed = MtvRoomSearchResponse.parse(pageBodyRaw);

        assert.equal(pageBodyParsed.page, PAGE_OUT_OF_BOUND);
        assert.equal(pageBodyParsed.totalEntries, 1);
        assert.isFalse(pageBodyParsed.hasMore);
        assert.isEmpty(pageBodyParsed.data);
    });
});