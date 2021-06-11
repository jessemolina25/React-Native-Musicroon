import { Theme } from 'dripsy';
import { useState } from 'react';
import { colorPalette } from '../constants/Colors';

type ApplicationTheme = 'dark' | 'light';

interface UseThemeReturn {
    colorScheme: ApplicationTheme;
    theme: Theme;
    toggleColorScheme: () => void;
}

export function useTheme(): UseThemeReturn {
    const [colorScheme, setColorScheme] = useState<ApplicationTheme>('dark');
    const palette = colorPalette(colorScheme);
    const theme: Theme = {
        colors: {
            ...palette,
        },
        space: {
            none: 0,
            xs: 2,
            s: 4,
            m: 8,
            l: 16,
            xl: 24,
        },
        borderWidths: {
            s: 1,
            m: 2,
            l: 3,
        },
        fontSizes: {
            xs: 14,
            s: 16,
            m: 20,
            l: 24,
            xl: 32,
        },
        radii: {
            s: 5,
            m: 10,
            l: 15,
            full: 9999,
        },
    };

    const toggleColorScheme = () => {
        setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
    };

    return {
        colorScheme,
        theme,
        toggleColorScheme,
    };
}
