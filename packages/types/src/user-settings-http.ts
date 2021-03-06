import * as z from 'zod';
import { UserSettingVisibility } from './user-settings';

export const GetMySettingsResponseBody = z.object({
    nickname: z.string(),
    hasLinkedGoogleAccount: z.boolean(),
    playlistsVisibilitySetting: UserSettingVisibility,
    relationsVisibilitySetting: UserSettingVisibility,
});
export type GetMySettingsResponseBody = z.infer<
    typeof GetMySettingsResponseBody
>;

export const UpdatePlaylistsVisibilityRequestBody = z.object({
    visibility: UserSettingVisibility,
});
export type UpdatePlaylistsVisibilityRequestBody = z.infer<
    typeof UpdatePlaylistsVisibilityRequestBody
>;

export const UpdatePlaylistsVisibilityResponseBody = z.object({
    status: z.enum(['SUCCESS']),
});
export type UpdatePlaylistsVisibilityResponseBody = z.infer<
    typeof UpdatePlaylistsVisibilityResponseBody
>;

export const UpdateRelationsVisibilityRequestBody = z.object({
    visibility: UserSettingVisibility,
});
export type UpdateRelationsVisibilityRequestBody = z.infer<
    typeof UpdateRelationsVisibilityRequestBody
>;

export const UpdateRelationsVisibilityResponseBody = z.object({
    status: z.enum(['SUCCESS']),
});
export type UpdateRelationsVisibilityResponseBody = z.infer<
    typeof UpdateRelationsVisibilityResponseBody
>;

export const UpdateNicknameRequestBody = z.object({
    nickname: z.string().nonempty(),
});
export type UpdateNicknameRequestBody = z.infer<
    typeof UpdateNicknameRequestBody
>;

export const UpdateNicknameResponseStatus = z.enum([
    'SUCCESS',
    'SAME_NICKNAME',
    'UNAVAILABLE_NICKNAME',
]);
export type UpdateNicknameResponseStatus = z.infer<
    typeof UpdateNicknameResponseStatus
>;

export const UpdateNicknameResponseBody = z.object({
    status: UpdateNicknameResponseStatus,
});
export type UpdateNicknameResponseBody = z.infer<
    typeof UpdateNicknameResponseBody
>;
