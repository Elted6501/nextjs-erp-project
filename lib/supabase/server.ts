import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies()


    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch (error) {
                        console.log(error);
                    }
                },
            },
        }
    )
}

export async function createAdminClient() {
    const cookieStore = await cookies();
    
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                set(name: string, value: string, options: any) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Handle error if needed
                    }
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                remove(name: string, options: any) {
                    try {
                        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
                    } catch (error) {
                        // Handle error if needed
                    }
                },
            },
        }
    );
}
