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
            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
                alert('Failed to logout: ' + error.message);
                return;
            }

            // Clear localStorage
            clearAuthFromLocal();

            // Refresh the page to show login form
            window.location.reload();
        } catch (err) {
            console.error('Unexpected logout error:', err);
            alert('An unexpected error occurred during logout');
        } finally {
            setIsLoggingOut(false);
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