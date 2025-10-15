import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

    return createBrowserClient(url, key, {
        db: { schema: 'public' },
        realtime: {
            params: { eventsPerSecond: 10 },
        },
    })
}
