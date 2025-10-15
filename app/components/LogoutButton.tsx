'use client';

import { createClient } from '@/utils/supabase/component';
import { clearAuthFromLocal } from '@/utils/auth-to-local';
import { useState } from 'react';

const LogoutButton = () => {
    const supabase = createClient();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            // Create a timeout that RESOLVES with a tagged result instead of rejecting
            // This avoids try/catch around Promise.race and keeps types precise
            const timeoutPromise: Promise<{ type: 'timeout' }> = new Promise((resolve) => {
                setTimeout(() => resolve({ type: 'timeout' }), 5000);
            });

            // Wrap Supabase signOut so the race returns a tagged union
            const signOutPromise: Promise<{
                type: 'signout';
                result: Awaited<ReturnType<typeof supabase.auth.signOut>>;
            }> = supabase.auth.signOut().then((res) => ({ type: 'signout', result: res }));

            // Race between sign out and timeout, both sides resolve with a tag
            const winner = await Promise.race([signOutPromise, timeoutPromise]);

            if (winner.type === 'signout') {
                // Normal path, check Supabase response
                const { error } = winner.result;
                if (error) {
                    console.error('Logout error:', error);
                }
            } else {
                // Timeout path
                console.warn('Logout timed out, continuing with local logout');
            }

            // Clear localStorage in either case
            clearAuthFromLocal();

            // Refresh the page to show login form
            window.location.reload();
        } catch (err) {
            // Catch truly unexpected errors
            console.error('Unexpected logout error:', err);
            clearAuthFromLocal();
            window.location.reload();
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="fixed top-6 left-6 z-50 px-6 py-3 rounded-2xl bg-black/50 backdrop-blur-sm text-white font-semibold hover:bg-black/70 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoggingOut ? 'Logging out...' : 'Log out'}
        </button>
    );
};

export default LogoutButton;