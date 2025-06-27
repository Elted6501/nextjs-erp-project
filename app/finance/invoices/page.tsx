import Invoice from "@/components/Invoice";

export default function InvoicesPage() {
  return (
      <Invoice
    company={{
      name: 'Nitro Drive',
      taxAddress: '123 Example Street, Mexico City, CDMX',
      phone: '555-123-4567',
      email: 'info@nitrodrive.com',
    }}
    client={{
      name: 'John Smith',
      address: '456 Client Avenue, Guadalajara',
      phone: '332-111-2233',
      mobile: '332-444-5566',
    }}
    invoice={{
      id: 'INV-001',
      creationDate: '2025-06-25',
      dueDate: '2025-07-10',
      deliveryDate: '2025-06-26',
      paymentType: 'Single payment',
      paymentMethod: 'Bank Transfer',
      currency: 'MXN',
    }}
    products={[
      {
        name: 'Oil Filter',
        quantity: 10,
        description: 'Engine oil filter - standard',
        unitPrice: 680,
        amount: 6800,
      },
      {
        name: 'Air Filter',
        quantity: 5,
        description: 'High-efficiency air filter',
        unitPrice: 450,
        amount: 2250,
      },
    ]}
  />
);
}
