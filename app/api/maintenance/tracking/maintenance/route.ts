import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const folio = new URLSearchParams(new URL(req.url).searchParams).get('folio');

    if (typeof folio === 'string') {
        const supabase = await createClient();

        const { data, error } = await supabase.from('maintenance').select().eq('maintenance_folio', folio)

        if (error)
            return NextResponse.json({ error }, { status: 500 })

        return NextResponse.json({ data }, { status: 200 })
    }

    return NextResponse.json({ error: 'There was an error' }, { status: 500 })
}