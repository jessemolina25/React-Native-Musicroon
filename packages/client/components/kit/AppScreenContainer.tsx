import React from 'react';
import { View } from 'dripsy';

interface AppScreenContainerProps {
    scrollable?: boolean;
    testID?: string;
}

const AppScreenContainer: React.FC<AppScreenContainerProps> = ({
    scrollable = false,
    testID,
    children,
}) => {
    return (
        <View
            testID={testID}
            sx={{
                paddingLeft: 'l',
                paddingRight: 'l',
                flex: 1,
                // The initial height of the element is not its content height,
                // it's 0 so that it grows only how we want it to grow.
                flexBasis: 0,

                // Enable vertical scrolling on tablets and desktops.
                overflowY:
                    scrollable === true ? [undefined, 'scroll'] : undefined,
            }}
        >
            {children}
        </View>
    );
};

export default AppScreenContainer;
