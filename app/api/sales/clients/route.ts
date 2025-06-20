import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/sales/clients/[id] - Obtener un cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const clientId = parseInt(params.id);
    
    if (isNaN(clientId)) {
      return NextResponse.json(
        { error: 'Invalid client ID' },
        { status: 400 }
      );
    }
    
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('client_id', clientId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Error fetching client', details: error.message },
        { status: 500 }
      );
    }
    
    const mappedClient = {
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
    };
    
    return NextResponse.json(mappedClient);
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/sales/clients/[id] - Actualizar un cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const clientId = parseInt(params.id);
    const body = await request.json();
    
    if (isNaN(clientId)) {
      return NextResponse.json(
        { error: 'Invalid client ID' },
        { status: 400 }
      );
    }
    
    // Verificar que el cliente existe
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('client_id')
      .eq('client_id', clientId)
      .single();
    
    if (checkError || !existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
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
    
    // Verificar que email o tax_id no estén siendo usados por otro cliente
    const { data: duplicates, error: dupError } = await supabase
      .from('clients')
      .select('client_id')
      .or(`email.eq.${body.email},tax_id.eq.${body.tax_id}`)
      .neq('client_id', clientId);
    
    if (dupError) {
      console.error('Error checking duplicates:', dupError);
      return NextResponse.json(
        { error: 'Error validating client data' },
        { status: 500 }
      );
    }
    
    if (duplicates && duplicates.length > 0) {
      return NextResponse.json(
        { error: 'Another client already has this email or tax ID' },
        { status: 400 }
      );
    }
    
    // Preparar datos para actualizar (excluir client_id/client_ID)
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
      country: body.country,
      notes: body.notes || null,
      status: body.status || 'Active'
    };
    
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('client_id', clientId)
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

// DELETE /api/sales/clients/[id] - Eliminar un cliente (cambiar estado a Inactive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const clientId = parseInt(params.id);
    
    if (isNaN(clientId)) {
      return NextResponse.json(
        { error: 'Invalid client ID' },
        { status: 400 }
      );
    }
    
    // En lugar de eliminar físicamente, cambiar el estado a Inactive
    const { data, error } = await supabase
      .from('clients')
      .update({ status: 'Inactive' })
      .eq('client_id', clientId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Error deactivating client', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Client deactivated successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}