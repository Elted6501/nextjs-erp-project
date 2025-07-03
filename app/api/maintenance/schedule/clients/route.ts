import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server';

async function getIndividualClients() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('clients').select().eq('client_type', 'Individual').not('first_name', 'is', null);

    if (error) return { error }
    else return { data }
}

export async function GET() {
    const clients = await getIndividualClients();

    if (clients?.error) {
        return NextResponse.json({ error: clients?.error }, { status: 500 });
    }

    return NextResponse.json({ clients: clients?.data }, { status: 200 });

}