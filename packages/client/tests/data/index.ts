import { factory, primaryKey } from '@mswjs/data';
import { datatype, name, random } from 'faker';

export const db = factory({
    tracks: {
        id: primaryKey(() => datatype.uuid()),
        title: () => random.words(3),
        artistName: () => name.findName(),
        duration: () => datatype.number(),
    },

    tracksMetadata: {
        id: primaryKey(() => datatype.uuid()),
        artistName: () => name.title(),
        duration: () => 42000 as number,
        title: () => random.words(),
        score: () => datatype.number(),
    },

    suggestedTracksMetadata: {
        id: primaryKey(() => datatype.uuid()),
        artistName: () => name.title(),
        duration: () => 42000 as number,
        title: () => random.words(),
        score: () => datatype.number(),
    },
});
