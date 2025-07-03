import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const res = await request.json();
    if(typeof res.id_maintenance === 'string' && typeof res.id_products === 'string' ){
        const supabase = await createClient();
        const {error} = await supabase.from('Maintenance_Items').insert({
            id_maintenance: res.id_maintenance,
            id_products: res.id_products
        });

        if(error){
            return NextResponse.json({ error}, { status: 500 });            
        }
        return NextResponse.json({ status: 200 });
    }

    return NextResponse.json({ error: 'There was a problem' }, { status: 500 });
}