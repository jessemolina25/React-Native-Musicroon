import urlcat from 'urlcat';
import * as z from 'zod';
import { SERVER_ENDPOINT } from '../constants/Endpoints';
import { TrackMetadata } from '@musicroom/types';

interface FetchTracksArgs {
    searchQuery: string;
    tracks?: TrackMetadata[];
}

export const SearchTracksAPIRawResponse = TrackMetadata.array().optional();
export type SearchTracksAPIRawResponse = z.infer<
    typeof SearchTracksAPIRawResponse
>;

const SearchTracksCache = new Map<string, TrackMetadata>();

export async function fetchTracksSuggestions({
    searchQuery,
}: FetchTracksArgs): Promise<TrackMetadata[] | undefined> {
    const url = urlcat(SERVER_ENDPOINT, '/search/track/:searchQuery', {
        searchQuery,
    });
    const response = await fetch(url);
    if (response.ok === false) {
        throw new Error('Could not get tracks');
    }

    const tracksMetadata = SearchTracksAPIRawResponse.parse(
        await response.json(),
    );
    if (tracksMetadata === undefined) {
        return tracksMetadata;
    }

    for (const trackMetadata of tracksMetadata) {
        SearchTracksCache.set(trackMetadata.id, trackMetadata);
    }

    return tracksMetadata;
}

export async function fetchTrackByID(
    trackID: string,
): Promise<TrackMetadata | undefined> {
    const trackInCache = SearchTracksCache.get(trackID);

    return Promise.resolve(trackInCache);
}

export async function fetchTracksByID(
    trackIDs: string[],
): Promise<TrackMetadata[] | undefined> {
    const tracksMetadata: TrackMetadata[] = [];

    for (const trackID of trackIDs) {
        const trackMetadata = await fetchTrackByID(trackID);
        if (trackMetadata === undefined) {
            continue;
        }

        tracksMetadata.push(trackMetadata);
    }

    return Promise.resolve(tracksMetadata);
}