import type {User} from '@supabase/supabase-js';

const KEYS = {
    username: 'username',
    sessionId: 'sessionId',
};

// Save the username and session ID to localstorage
export function saveAuthToLocal(user?: User | null) {
    if (typeof window === 'undefined' || !user) return;
    const username = (user.user_metadata?.username as string | undefined) || '';
    if (username) localStorage.setItem(KEYS.username, username);
    localStorage.setItem(KEYS.sessionId, user.id);
}

// clear localstorage when user logout
export function clearAuthFromLocal() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.username);
    localStorage.removeItem(KEYS.sessionId);
}