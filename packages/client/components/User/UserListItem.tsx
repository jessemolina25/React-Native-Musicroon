import {
    AntDesign,
    Foundation,
    MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Skeleton } from '@motify/skeleton';
import { MtvRoomUsersListElement } from '@musicroom/types';
import { Image, Text, useSx, View } from 'dripsy';
import React from 'react';
import { TouchableOpacity } from 'react-native';

type UserListItemProps =
    | { loading: true }
    | {
          loading: false;
          index: number;
          user: MtvRoomUsersListElement;
          onPress?: () => void;
          Actions?: () => React.ReactElement;
      };

const UserListItem: React.FC<UserListItemProps> = (props) => {
    const sx = useSx();

    return (
        <Skeleton show={props.loading} width="100%">
            {props.loading === false ? (
                <View
                    sx={{
                        flex: 1,
                        padding: 'm',
                        backgroundColor: 'greyLight',
                        // opacity: disabled ? 0.8 : 1,
                        borderRadius: 's',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                    testID={`${props.user.nickname}-user-card`}
                >
                    <TouchableOpacity
                        // disabled={disabled}
                        onPress={props.onPress}
                        style={{ flex: 1 }}
                    >
                        <View
                            sx={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <View
                                sx={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <Image
                                    source={{
                                        uri: 'https://stately.ai/registry/machines/03107919-a451-4085-9b66-633cd8794164.png',
                                    }}
                                    sx={{
                                        width: 'm',
                                        height: 'm',
                                        marginRight: 'm',
                                    }}
                                />

                                <Text
                                    sx={{
                                        color: 'white',
                                        marginBottom: 'xs',
                                    }}
                                >
                                    {props.user.nickname}
                                </Text>
                                {props.user.isMe && (
                                    <Text
                                        sx={{
                                            color: 'white',
                                            marginBottom: 'xs',
                                            padding: 's',
                                        }}
                                    >
                                        (You)
                                    </Text>
                                )}
                                {props.user.isCreator && (
                                    <MaterialCommunityIcons
                                        name="crown"
                                        accessibilityLabel={`${props.user.nickname} is the room creator`}
                                        style={sx({
                                            fontSize: 'm',
                                            color: 'white',
                                            padding: 's',
                                        })}
                                        color="black"
                                    />
                                )}
                            </View>
                            <View
                                sx={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                {props.user.isDelegationOwner && (
                                    <Foundation
                                        name="music"
                                        accessibilityLabel={`${props.user.nickname} is the delegation owner`}
                                        style={sx({
                                            fontSize: 'm',
                                            color: 'white',
                                            padding: 's',
                                        })}
                                        color="black"
                                    />
                                )}
                                {props.user
                                    .hasControlAndDelegationPermission && (
                                    <AntDesign
                                        name="star"
                                        accessibilityLabel={`${props.user.nickname} has control and delegation permission`}
                                        style={sx({
                                            fontSize: 'm',
                                            color: 'white',
                                            padding: 's',
                                        })}
                                        color="black"
                                    />
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>

                    {props.Actions !== undefined ? <props.Actions /> : null}
                </View>
            ) : undefined}
        </Skeleton>
    );
};

export default UserListItem;
