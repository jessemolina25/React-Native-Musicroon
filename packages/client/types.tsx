/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */
import { TrackMetadata } from '@musicroom/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
    CompositeNavigationProp,
    NavigatorScreenParams,
    RouteProp,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type ApplicationState = 'SHOW_APPLICATION_LOADER' | 'AUTHENTICATED';

export type NavigateFromRefParams = {
    Alert: AlertParams;
    HomeScreen: undefined;
} & RootStackParamList &
    MusicTrackVoteCreationFormParamList;

export type NavigateFromRefRoutes = keyof NavigateFromRefParams;

export type BottomTabNavigatorParamList = {
    Home: NavigatorScreenParams<HomeParamsList>;
    Search: NavigatorScreenParams<SearchTracksParamsList>;
    Library: NavigatorScreenParams<LibraryParamsList>;
};

export type HomeParamsList = {
    HomeScreen: undefined;
};

export type SearchTracksParamsList = {
    SearchTracks: undefined;
    SearchTrackResults: SearchTracksResultsParams;
};

export type LibraryParamsList = {
    MpeRooms: undefined;
    MpeRoom: NavigatorScreenParams<MpeRoomParamsList>;
};

export type MpeRoomParamsList = {
    Room: MpeRoomParams;
    SearchTracks: MpeRoomParams;
};

export type RootStackParamList = {
    Main: NavigatorScreenParams<MainStackParamList>;

    SuggestTrack: NavigatorScreenParams<SuggestTrackStackParamList>;

    MusicTrackVoteCreationForm: NavigatorScreenParams<MusicTrackVoteCreationFormParamList>;

    MusicTrackVoteUsersList: NavigatorScreenParams<MusicTrackVoteUsersListStackParamList>;

    MusicTrackVoteChat: NavigatorScreenParams<MusicTrackVoteChatStackParamList>;

    MusicTrackVoteConstraintsDetails: NavigatorScreenParams<MusicTrackVoteConstraintsDetailsParamList>;

    MusicTrackVoteUsersSearch: NavigatorScreenParams<MusicTrackVoteUsersSearchStackParamList>;

    UserProfile: NavigatorScreenParams<UserProfileStackParamsList>;
};

export type SuggestTrackStackParamList = {
    SuggestTrackModal: undefined;
};

export type MusicTrackVoteCreationFormParamList = {
    MusicTrackVoteCreationFormName: undefined;
    MusicTrackVoteCreationFormOpeningStatus: undefined;
    MusicTrackVoteCreationFormPhysicalConstraints: undefined;
    MusicTrackVoteCreationFormPlayingMode: undefined;
    MusicTrackVoteCreationFormVotesConstraints: undefined;
    MusicTrackVoteCreationFormConfirmation: undefined;
};

export type MusicTrackVoteUsersListStackParamList = {
    MusicTrackVoteUsersListModal: undefined;
};

export type MusicTrackVoteChatStackParamList = {
    MusicTrackVoteChatModal: undefined;
};

export type MusicTrackVoteConstraintsDetailsParamList = {
    MusicTrackVoteConstraintsDetailsModal: undefined;
};

export type UserProfileStackParamsList = {
    UserProfile: UserProfileParams;
};

export type MusicTrackVoteUsersSearchStackParamList = {
    MusicTrackVoteUsersSearchModal: undefined;
};

export type MainStackParamList = {
    Root: NavigatorScreenParams<BottomTabNavigatorParamList>;

    MusicTrackVoteSearch: undefined;

    Settings: undefined;

    Alert: AlertParams;
};

interface AlertParams {
    reason: 'FORCED_DISCONNECTION';
}
interface UserProfileParams {
    userID: string;
}
interface SearchTracksResultsParams {
    tracks?: TrackMetadata[];
}

interface MpeRoomParams {
    id: string;
}

/**
 * See https://reactnavigation.org/docs/typescript/#nesting-navigators
 * for more information about typing nested navigators.
 *
 * Please note that two screen MUST NOT have the same name.
 * Otherwise the type safety will be disabled.
 */

export type SuggestTrackModalProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'SuggestTrack'>,
        StackNavigationProp<SuggestTrackStackParamList, 'SuggestTrackModal'>
    >;
    route: RouteProp<SuggestTrackStackParamList, 'SuggestTrackModal'>;
};

export type MusicTrackVoteUsersListModalProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'MusicTrackVoteUsersList'>,
        StackNavigationProp<
            MusicTrackVoteUsersListStackParamList,
            'MusicTrackVoteUsersListModal'
        >
    >;
    route: RouteProp<
        MusicTrackVoteUsersListStackParamList,
        'MusicTrackVoteUsersListModal'
    >;
};

export type MusicTrackVoteCreationFormNameScreenProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'MusicTrackVoteCreationForm'>,
        StackNavigationProp<
            MusicTrackVoteCreationFormParamList,
            'MusicTrackVoteCreationFormName'
        >
    >;

    route: RouteProp<
        MusicTrackVoteCreationFormParamList,
        'MusicTrackVoteCreationFormName'
    >;
};

export type MusicTrackVoteCreationFormOpeningStatusScreenProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'MusicTrackVoteCreationForm'>,
        StackNavigationProp<
            MusicTrackVoteCreationFormParamList,
            'MusicTrackVoteCreationFormOpeningStatus'
        >
    >;

    route: RouteProp<
        MusicTrackVoteCreationFormParamList,
        'MusicTrackVoteCreationFormOpeningStatus'
    >;
};

export type MusicTrackVoteCreationFormPhysicalConstraintsScreenProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'MusicTrackVoteCreationForm'>,
        StackNavigationProp<
            MusicTrackVoteCreationFormParamList,
            'MusicTrackVoteCreationFormPhysicalConstraints'
        >
    >;

    route: RouteProp<
        MusicTrackVoteCreationFormParamList,
        'MusicTrackVoteCreationFormPhysicalConstraints'
    >;
};

export type MusicTrackVoteCreationFormPlayingModeScreenProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'MusicTrackVoteCreationForm'>,
        StackNavigationProp<
            MusicTrackVoteCreationFormParamList,
            'MusicTrackVoteCreationFormPlayingMode'
        >
    >;

    route: RouteProp<
        MusicTrackVoteCreationFormParamList,
        'MusicTrackVoteCreationFormPlayingMode'
    >;
};

export type MusicTrackVoteCreationFormVotesConstraintsScreenProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'MusicTrackVoteCreationForm'>,
        StackNavigationProp<
            MusicTrackVoteCreationFormParamList,
            'MusicTrackVoteCreationFormVotesConstraints'
        >
    >;

    route: RouteProp<
        MusicTrackVoteCreationFormParamList,
        'MusicTrackVoteCreationFormVotesConstraints'
    >;
};

export type MusicTrackVoteCreationFormConfirmationScreenProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'MusicTrackVoteCreationForm'>,
        StackNavigationProp<
            MusicTrackVoteCreationFormParamList,
            'MusicTrackVoteCreationFormConfirmation'
        >
    >;

    route: RouteProp<
        MusicTrackVoteCreationFormParamList,
        'MusicTrackVoteCreationFormConfirmation'
    >;
};

export type MusicTrackVoteSearchScreenProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'Main'>,
        StackNavigationProp<MainStackParamList, 'MusicTrackVoteSearch'>
    >;
    route: RouteProp<MainStackParamList, 'MusicTrackVoteSearch'>;
};

export type MusicTrackVoteChatModalProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'MusicTrackVoteChat'>,
        StackNavigationProp<
            MusicTrackVoteChatStackParamList,
            'MusicTrackVoteChatModal'
        >
    >;
    route: RouteProp<
        MusicTrackVoteChatStackParamList,
        'MusicTrackVoteChatModal'
    >;
};

export type MusicTrackVoteUsersSearchModalProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'MusicTrackVoteUsersSearch'>,
        StackNavigationProp<
            MusicTrackVoteUsersSearchStackParamList,
            'MusicTrackVoteUsersSearchModal'
        >
    >;
    route: RouteProp<
        MusicTrackVoteUsersSearchStackParamList,
        'MusicTrackVoteUsersSearchModal'
    >;
};

export type SettingsScreenProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'Main'>,
        StackNavigationProp<MainStackParamList, 'Settings'>
    >;
    route: RouteProp<MainStackParamList, 'Settings'>;
};

export type AlertScreenProps = {
    navigation: CompositeNavigationProp<
        StackNavigationProp<RootStackParamList, 'Main'>,
        StackNavigationProp<MainStackParamList, 'Alert'>
    >;
    route: RouteProp<MainStackParamList, 'Alert'>;
};

export type UserProfileScreenProps = {
    navigation: StackNavigationProp<UserProfileStackParamsList, 'UserProfile'>;
    route: RouteProp<UserProfileStackParamsList, 'UserProfile'>;
};

export type HomeTabProps = {
    navigation: CompositeNavigationProp<
        CompositeNavigationProp<
            StackNavigationProp<RootStackParamList, 'Main'>,
            StackNavigationProp<MainStackParamList, 'Root'>
        >,
        BottomTabNavigationProp<BottomTabNavigatorParamList, 'Home'>
    >;
    route: RouteProp<BottomTabNavigatorParamList, 'Home'>;
};

export type SearchTabProps = {
    navigation: CompositeNavigationProp<
        CompositeNavigationProp<
            StackNavigationProp<RootStackParamList, 'Main'>,
            StackNavigationProp<MainStackParamList, 'Root'>
        >,
        BottomTabNavigationProp<BottomTabNavigatorParamList, 'Search'>
    >;
    route: RouteProp<BottomTabNavigatorParamList, 'Search'>;
};

export type HomeTabHomeScreenScreenProps = {
    navigation: CompositeNavigationProp<
        CompositeNavigationProp<
            StackNavigationProp<RootStackParamList, 'Main'>,
            StackNavigationProp<MainStackParamList, 'Root'>
        >,
        CompositeNavigationProp<
            BottomTabNavigationProp<BottomTabNavigatorParamList, 'Home'>,
            StackNavigationProp<HomeParamsList, 'HomeScreen'>
        >
    >;
    route: RouteProp<HomeParamsList, 'HomeScreen'>;
};

export type SearchTabSearchTracksScreenProps = {
    navigation: CompositeNavigationProp<
        CompositeNavigationProp<
            StackNavigationProp<RootStackParamList, 'Main'>,
            StackNavigationProp<MainStackParamList, 'Root'>
        >,
        CompositeNavigationProp<
            BottomTabNavigationProp<BottomTabNavigatorParamList, 'Search'>,
            StackNavigationProp<SearchTracksParamsList, 'SearchTracks'>
        >
    >;
    route: RouteProp<SearchTracksParamsList, 'SearchTracks'>;
};

export type MpeTabMpeRoomsScreenProps = {
    navigation: CompositeNavigationProp<
        CompositeNavigationProp<
            StackNavigationProp<RootStackParamList, 'Main'>,
            StackNavigationProp<MainStackParamList, 'Root'>
        >,
        CompositeNavigationProp<
            BottomTabNavigationProp<BottomTabNavigatorParamList, 'Library'>,
            StackNavigationProp<LibraryParamsList, 'MpeRooms'>
        >
    >;
    route: RouteProp<LibraryParamsList, 'MpeRooms'>;
};

export type MpeTabMpeRoomScreenProps = {
    navigation: CompositeNavigationProp<
        CompositeNavigationProp<
            CompositeNavigationProp<
                StackNavigationProp<RootStackParamList, 'Main'>,
                StackNavigationProp<MainStackParamList, 'Root'>
            >,
            CompositeNavigationProp<
                BottomTabNavigationProp<BottomTabNavigatorParamList, 'Library'>,
                StackNavigationProp<LibraryParamsList, 'MpeRoom'>
            >
        >,
        CompositeNavigationProp<
            StackNavigationProp<LibraryParamsList, 'MpeRoom'>,
            StackNavigationProp<MpeRoomParamsList, 'Room'>
        >
    >;
    route: RouteProp<MpeRoomParamsList, 'Room'>;
};

export type MpeTabMpeSearchTracksScreenProps = {
    navigation: CompositeNavigationProp<
        CompositeNavigationProp<
            CompositeNavigationProp<
                StackNavigationProp<RootStackParamList, 'Main'>,
                StackNavigationProp<MainStackParamList, 'Root'>
            >,
            CompositeNavigationProp<
                BottomTabNavigationProp<BottomTabNavigatorParamList, 'Library'>,
                StackNavigationProp<LibraryParamsList, 'MpeRoom'>
            >
        >,
        CompositeNavigationProp<
            StackNavigationProp<LibraryParamsList, 'MpeRoom'>,
            StackNavigationProp<MpeRoomParamsList, 'SearchTracks'>
        >
    >;
    route: RouteProp<MpeRoomParamsList, 'SearchTracks'>;
};
