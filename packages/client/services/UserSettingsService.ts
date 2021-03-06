import {
    GetMySettingsResponseBody,
    LinkGoogleAccountRequestBody,
    LinkGoogleAccountResponseBody,
    UpdateNicknameRequestBody,
    UpdateNicknameResponseBody,
    UpdatePlaylistsVisibilityRequestBody,
    UpdatePlaylistsVisibilityResponseBody,
    UpdateRelationsVisibilityRequestBody,
    UpdateRelationsVisibilityResponseBody,
    UserSettingVisibility,
} from '@musicroom/types';
import { request } from './http';

export async function getMySettings(): Promise<GetMySettingsResponseBody> {
    const rawResponse = await request.get('/me/settings');
    const parsedResponse = GetMySettingsResponseBody.parse(rawResponse.data);

    return parsedResponse;
}

interface SetUserPlaylistsSettingVisibilityArgs {
    visibility: UserSettingVisibility;
}

export async function setUserPlaylistsSettingVisibility({
    visibility,
}: SetUserPlaylistsSettingVisibilityArgs): Promise<UpdatePlaylistsVisibilityResponseBody> {
    const body: UpdatePlaylistsVisibilityRequestBody = {
        visibility,
    };

    const rawResponse = await request.post('/me/playlists-visibility', body);
    const parsedResponse = UpdatePlaylistsVisibilityResponseBody.parse(
        rawResponse.data,
    );

    return parsedResponse;
}

interface SetUserRelationsSettingVisibilityArgs {
    visibility: UserSettingVisibility;
}

export async function setUserRelationsSettingVisibility({
    visibility,
}: SetUserRelationsSettingVisibilityArgs): Promise<UpdateRelationsVisibilityResponseBody> {
    const body: UpdateRelationsVisibilityRequestBody = {
        visibility,
    };
    const rawResponse = await request.post('/me/relations-visibility', body);
    const parsedResponse = UpdateRelationsVisibilityResponseBody.parse(
        rawResponse.data,
    );

    return parsedResponse;
}

interface SetUserNicknameArgs {
    nickname: string;
}

export async function setUserNickname({
    nickname,
}: SetUserNicknameArgs): Promise<UpdateNicknameResponseBody> {
    const body: UpdateNicknameRequestBody = {
        nickname,
    };
    const rawResponse = await request.post('/me/nickname', body);
    const parsedResponse = UpdateNicknameResponseBody.parse(rawResponse.data);

    return parsedResponse;
}

export async function sendLinkGoogleAccount(
    body: LinkGoogleAccountRequestBody,
): Promise<LinkGoogleAccountResponseBody> {
    const rawResponse = await request.post('/me/link-google-account', body, {
        validateStatus: (status) => status === 200 || status === 400,
    });
    const parsedResponse = LinkGoogleAccountResponseBody.parse(
        rawResponse.data,
    );

    return parsedResponse;
}
