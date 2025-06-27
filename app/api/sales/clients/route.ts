import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/sales/clients - Obtener todos los clientes con filtros opcionales y paginación
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;
    
    // Filtros
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Construir query base
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' });
    
    // Aplicar filtro de estado si existe
    if (status && status !== 'All') {
      query = query.eq('status', status);
    }
    
    // Aplicar búsqueda si existe
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,tax_id.ilike.%${search}%`);
    }
    
    // Aplicar paginación y ordenamiento
    query = query
      .order('client_id', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json(
        { error: 'Error fetching clients', details: error.message },
        { status: 500 }
      );
    }
    
    // Mapear los datos para usar client_id en minúsculas en el frontend
    const mappedData = data?.map(client => ({
      client_id: client.client_id,
      client_type: client.client_type,
      taxpayer_type: client.taxpayer_type,
      business_name: client.business_name,
      first_name: client.first_name,
      last_name: client.last_name,
      tax_id: client.tax_id,
      email: client.email,
      phone: client.phone,
      mobile_phone: client.mobile_phone,
      address: client.address,
      city: client.city,
      state: client.state,
      zip_code: client.zip_code,
      country: client.country,
      notes: client.notes,
      status: client.status,
      created_at: client.created_at,
      updated_at: client.updated_at
    })) || [];
    
    return NextResponse.json({
      data: mappedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/sales/clients - Crear un nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // Validación básica
    if (!body.email || !body.tax_id || !body.phone || !body.address || 
        !body.city || !body.state || !body.country || !body.zip_code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validar que tenga nombre o razón social según el tipo
    if (body.client_type === 'Individual' && (!body.first_name || !body.last_name)) {
      return NextResponse.json(
        { error: 'First name and last name are required for individual clients' },
        { status: 400 }
      );
    }
    
    if (body.client_type === 'Business' && !body.business_name) {
      return NextResponse.json(
        { error: 'Business name is required for business clients' },
        { status: 400 }
      );
    }
    
    // Verificar si el email o tax_id ya existen
    const { data: existingClients, error: checkError } = await supabase
      .from('clients')
      .select('client_id')
      .or(`email.eq.${body.email},tax_id.eq.${body.tax_id}`)
      .limit(1);
    
    if (checkError) {
      console.error('Error checking existing clients:', checkError);
      return NextResponse.json(
        { error: 'Error validating client data' },
        { status: 500 }
      );
    }
    
    if (existingClients && existingClients.length > 0) {
      return NextResponse.json(
        { error: 'A client with this email or tax ID already exists' },
        { status: 400 }
      );
    }
    
    // Preparar datos para insertar (client_id se genera automáticamente)
    const clientData = {
      client_type: body.client_type || 'Individual',
      taxpayer_type: body.taxpayer_type || 'Physical Person',
      business_name: body.business_name || null,
      first_name: body.first_name || null,
      last_name: body.last_name || null,
      tax_id: body.tax_id,
      email: body.email,
      phone: body.phone,
      mobile_phone: body.mobile_phone || null,
      address: body.address,
      city: body.city,
      state: body.state,
      zip_code: body.zip_code,
      country: body.country || 'Mexico',
      notes: body.notes || null,
      status: body.status || 'Active'
    };
    
    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting client:', insertError);
      return NextResponse.json(
        { error: 'Error creating client', details: insertError.message },
        { status: 500 }
      );
    }
    
    // Mapear la respuesta
    const mappedClient = {
      client_id: newClient.client_id,
      client_type: newClient.client_type,
      taxpayer_type: newClient.taxpayer_type,
      business_name: newClient.business_name,
      first_name: newClient.first_name,
      last_name: newClient.last_name,
      tax_id: newClient.tax_id,
      email: newClient.email,
      phone: newClient.phone,
      mobile_phone: newClient.mobile_phone,
      address: newClient.address,
      city: newClient.city,
      state: newClient.state,
      zip_code: newClient.zip_code,
      country: newClient.country,
      notes: newClient.notes,
      status: newClient.status,
      created_at: newClient.created_at,
      updated_at: newClient.updated_at
    };
    
    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      data: mappedClient
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/sales/clients - Actualizar un cliente existente
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // Validar que client_id esté presente en el body
    if (!body.client_id) {
      return NextResponse.json(
        { error: 'Client ID is required in request body' },
        { status: 400 }
      );
    }
    
    // Validación básica de campos requeridos
    if (!body.email || !body.tax_id || !body.phone || !body.address || 
        !body.city || !body.state || !body.country || !body.zip_code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validar que tenga nombre o razón social según el tipo
    if (body.client_type === 'Individual' && (!body.first_name || !body.last_name)) {
      return NextResponse.json(
        { error: 'First name and last name are required for individual clients' },
        { status: 400 }
      );
    }
    
    if (body.client_type === 'Business' && !body.business_name) {
      return NextResponse.json(
        { error: 'Business name is required for business clients' },
        { status: 400 }
      );
    }
    
    // Verificar si el cliente existe
    const { data: existingClient, error: checkExistError } = await supabase
      .from('clients')
      .select('client_id')
      .eq('client_id', body.client_id)
      .single();
    
    if (checkExistError || !existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    // Verificar si el email o tax_id ya existen en otros clientes
    const { data: conflictingClients, error: checkConflictError } = await supabase
      .from('clients')
      .select('client_id')
      .or(`email.eq.${body.email},tax_id.eq.${body.tax_id}`)
      .neq('client_id', body.client_id)
      .limit(1);
    
    if (checkConflictError) {
      console.error('Error checking conflicting clients:', checkConflictError);
      return NextResponse.json(
        { error: 'Error validating client data' },
        { status: 500 }
      );
    }
    
    if (conflictingClients && conflictingClients.length > 0) {
      return NextResponse.json(
        { error: 'Another client with this email or tax ID already exists' },
        { status: 400 }
      );
    }
    
    // Preparar datos para actualizar
    const updateData = {
      client_type: body.client_type || 'Individual',
      taxpayer_type: body.taxpayer_type || 'Physical Person',
      business_name: body.business_name || null,
      first_name: body.first_name || null,
      last_name: body.last_name || null,
      tax_id: body.tax_id,
      email: body.email,
      phone: body.phone,
      mobile_phone: body.mobile_phone || null,
      address: body.address,
      city: body.city,
      state: body.state,
      zip_code: body.zip_code,
      country: body.country || 'Mexico',
      notes: body.notes || null,
      status: body.status || 'Active',
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('client_id', body.client_id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating client:', updateError);
      return NextResponse.json(
        { error: 'Error updating client', details: updateError.message },
        { status: 500 }
      );
    }
    
    // Mapear la respuesta
    const mappedClient = {
      client_id: updatedClient.client_id,
      client_type: updatedClient.client_type,
      taxpayer_type: updatedClient.taxpayer_type,
      business_name: updatedClient.business_name,
      first_name: updatedClient.first_name,
      last_name: updatedClient.last_name,
      tax_id: updatedClient.tax_id,
      email: updatedClient.email,
      phone: updatedClient.phone,
      mobile_phone: updatedClient.mobile_phone,
      address: updatedClient.address,
      city: updatedClient.city,
      state: updatedClient.state,
      zip_code: updatedClient.zip_code,
      country: updatedClient.country,
      notes: updatedClient.notes,
      status: updatedClient.status,
      created_at: updatedClient.created_at,
      updated_at: updatedClient.updated_at
    };
    
    return NextResponse.json({
      success: true,
      message: 'Client updated successfully',
      data: mappedClient
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}