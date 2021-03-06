import { Platform } from 'react-native';
import redaxios from 'redaxios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    REQUEST_HEADER_APP_VERSION_KEY,
    REQUEST_HEADER_DEVICE_INFORMATION,
    REQUEST_HEADER_DEVICE_OS,
} from '@musicroom/types';
import { SERVER_ENDPOINT } from '../constants/Endpoints';
import {
    getConstantAppVersionWrapper,
    getDeviceNameWrapper,
    getPlatformOsWrapper,
} from './ExpoConstantsWrapper';

export const SHOULD_USE_TOKEN_AUTH = Platform.OS !== 'web';

type Requester = typeof redaxios & {
    /**
     * Tries to load the token from AsyncStorage and sets the Authorization header.
     * If token authentication should not be used, it's a no-op.
     * If the token is not found, it's a no-op.
     */
    loadToken(): Promise<void>;
    /**
     * Persists the token to AsyncStorage and sets the Authorization header.
     * If token authentication should not be used, it's a no-op.
     */
    persistToken(token: string): Promise<void>;
    /**
     * Removes the token from AsyncStorage and resets the Authorization header.
     * If token authentication should not be used, it's a no-op.
     * If the token is not found, it's a no-op.
     */
    clearToken(): Promise<void>;

    /**
     * Returns the api token if existing if not returns undefined
     */
    getToken(): Promise<undefined | string>;
};

/**
 * Creates a custom instance of redaxios that implements methods
 * to handle authentication by opaque tokens.
 *
 * This function must not be used outside of tests.
 */
export function createRequester(): Requester {
    const TOKEN_STORAGE_KEY = 'auth-token';

    const headers: Record<string, string> = {};
    headers[REQUEST_HEADER_DEVICE_OS] = getPlatformOsWrapper();

    const appVersion = getConstantAppVersionWrapper();
    if (appVersion !== undefined) {
        headers[REQUEST_HEADER_APP_VERSION_KEY] = appVersion;
    }

    const deviceName = getDeviceNameWrapper();
    if (deviceName !== undefined) {
        headers[REQUEST_HEADER_DEVICE_INFORMATION] = deviceName;
    }

    const request: Requester = redaxios.create({
        baseURL: SERVER_ENDPOINT,
        withCredentials: true,
        headers,
    });

    function setRequestAuthorizationHeader(token: string) {
        request.defaults.auth = `Bearer ${token}`;
    }

    async function loadToken(): Promise<void> {
        if (SHOULD_USE_TOKEN_AUTH === false) {
            return undefined;
        }

        const token = await getToken();

        if (token === undefined) {
            return;
        }

        setRequestAuthorizationHeader(token);
    }

    async function getToken(): Promise<undefined | string> {
        if (SHOULD_USE_TOKEN_AUTH === false) {
            return undefined;
        }

        const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (token === null) {
            return undefined;
        }

        return token;
    }

    async function persistToken(token: string): Promise<void> {
        if (SHOULD_USE_TOKEN_AUTH === false) {
            return undefined;
        }

        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);

        setRequestAuthorizationHeader(token);
    }

    async function clearToken(): Promise<void> {
        if (SHOULD_USE_TOKEN_AUTH === false) {
            return undefined;
        }

        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);

        delete request.defaults.auth;
    }

    request.loadToken = loadToken;
    request.persistToken = persistToken;
    request.clearToken = clearToken;
    request.getToken = getToken;

    return request;
}

/**
 * Singleton instance of our custom implementation of redaxios, that supports
 * authentication with opaque tokens.
 *
 * Should be used as a replacement for the default instance of redaxios.
 */
export const request = createRequester();
