'use client';

import {useEffect} from 'react';

/**
 * Shows a browser confirmation dialog when the user tries to leave the page.
 * @param when - A boolean that determines whether to show the prompt.
 * @param message - The message to show in the prompt (for legacy browsers).
 */
export const useBeforeUnload = (when: boolean, message: string) => {
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (when) {
                // This is the modern way to trigger the dialog.
                event.preventDefault();

                // This is required for legacy browser support.
                // Modern browsers will show a generic message instead of this custom one.
                event.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [when, message]);
};