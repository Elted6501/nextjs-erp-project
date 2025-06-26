import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
    const id = new URLSearchParams(new URL(req.url).searchParams).get('id');
    const date = new URLSearchParams(new URL(req.url).searchParams).get('date');

    if (typeof id === 'string' && typeof date === 'string') {
        const supabase = await createClient();
        const { data, error } = await supabase.from('maintenance').select().eq('employee_id', id.toString()).eq('mn_assigned', date.toString());

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    }

    return NextResponse.json({ error: 'There was a problem' }, { status: 500 });
}