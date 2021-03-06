import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import {
    AppScreen,
    AppScreenContainer,
    AppScreenHeader,
} from '../../components/kit';

interface LoadingScreenProps {
    testID?: string;
    title: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ testID, title }) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <AppScreen>
            <AppScreenHeader
                title={title}
                insetTop={insets.top}
                canGoBack
                goBack={() => {
                    navigation.goBack();
                }}
            />

            <AppScreenContainer testID={testID} />
        </AppScreen>
    );
};

export default LoadingScreen;
