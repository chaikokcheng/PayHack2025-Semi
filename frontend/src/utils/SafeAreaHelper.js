import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// Use this component in your screens instead of regular SafeAreaView
export const ScreenSafeArea = ({ children, style, ...props }) => {
    return (
        <SafeAreaView
            style={[{ flex: 1 }, style]}
            edges={['top', 'left', 'right']} // Exclude bottom edge to avoid conflict with tab bar
            {...props}
        >
            {children}
        </SafeAreaView>
    );
};

// For screens that don't have tab bar (like modal screens or full-screen)
export const FullScreenSafeArea = ({ children, style, ...props }) => {
    return (
        <SafeAreaView
            style={[{ flex: 1 }, style]}
            edges={['top', 'left', 'right', 'bottom']} // Include all edges
            {...props}
        >
            {children}
        </SafeAreaView>
    );
};
