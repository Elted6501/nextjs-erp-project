import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const res = await request.json();
    const supabase = await createClient();


    if (typeof res.notes === 'string' && (typeof res.employee_id === 'number' || typeof res.employee_id === 'string') && typeof res.status === 'string' && typeof res.mn_assigned === 'string' && typeof res.maintenance_folio === 'string') {

        const { error } = await supabase.from('maintenance').insert({
            employee_id: res.employee_id,
            status: res.status ? res.status : 'Scheduled',
            notes: res.notes,
            mn_made: new Date().toISOString(),
            mn_completed: new Date().toISOString(),
            mn_assigned: res.mn_assigned + '+00',
            maintenance_folio: res.maintenance_folio
        })

        if (error) {
            return NextResponse.json({ error }, { status: 500 })
        }
        return NextResponse.json({ status: 500 });
    }

    return NextResponse.json({error:'There was a problem'},{ status: 500 });
}

export async function GET(req: Request) {
    const supabase = await createClient();
    const url = new URL(req.url);
    const params = new URLSearchParams(url.searchParams)

    if (typeof params.get('id') === 'string' && typeof params.get('date') === 'string') {
        const { data, error } = await supabase.rpc('availablehoursdate', {
            employee_id_input: params.get('id')?.toString(),
            base_date: params.get('date')?.toString()
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }
        return NextResponse.json({ data }, { status: 200 });
    }
    return NextResponse.json({ error: "There was a problem" }, { status: 500 });

}