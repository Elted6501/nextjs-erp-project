import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function normalizeDate(input: string) {
    const [month, day, year] = input.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export async function GET(req: Request) {
    const id = new URLSearchParams(new URL(req.url).searchParams).get('id');
    const date = new URLSearchParams(new URL(req.url).searchParams).get('date');

    if (typeof id === 'string' && typeof date === 'string') {
        const supabase = await createClient();
        console.log(normalizeDate(date.toString().replaceAll('/', '-')));

        const { data, error } = await supabase.rpc('historial', {
            p_mn_completed: date.toString().replaceAll('/', '-'),
            p_employee_id: id.toString()
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    }

    return NextResponse.json({ error: 'There was a problem' }, { status: 500 });
}