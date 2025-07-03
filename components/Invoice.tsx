"use client";

import Image from "next/image";
import React from "react";

type Product = {
  name: string;
  quantity: number;
  description: string;
  unitPrice: number;
  amount: number;
};

type InvoiceProps = {
  company: {
    name: string;
    taxAddress: string;
    phone: string;
    email: string;
  };
  client: {
    name: string;
    address: string;
    phone: string;
    mobile: string;
  };
  invoice: {
    id: string;
    creationDate: string;
    dueDate: string;
    deliveryDate: string;
    paymentType: string;
    paymentMethod: string;
    currency: string;
  };
  products: Product[];
};

const Invoice: React.FC<InvoiceProps> = ({
  company,
  client,
  invoice,
  products,
}) => {
  const subtotal = products.reduce((acc, p) => acc + p.amount, 0);
  const vat = subtotal * 0.16;
  const total = subtotal + vat;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white text-gray-900 border shadow-lg text-sm mt-10">
      {/* Header with Logo and Company Info */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div className="flex items-center space-x-4">
          
            <Image
              src="/NitroDriveLogo4kpng.png"
              alt="Company Logo"
              width={100}
              height={100}
              className="object-contain"
              style={{ filter: "drop-shadow(2px 4px 3px black)"}}
            />
          <div>
            <h2 className="text-2xl font-bold text-red-700">{company.name}</h2>
            <p>{company.taxAddress}</p>
            <p>Phone: {company.phone}</p>
            <p>{company.email}</p>
          </div>
        </div>
        <div className="text-right border border-red-700 p-3 rounded">
          <p>
            <span className="font-bold text-red-700">Invoice ID:</span>{" "}
            {invoice.id}
          </p>
          <p>
            <span className="font-bold text-red-700">Issue Date:</span>{" "}
            {invoice.creationDate}
          </p>
          <p>
            <span className="font-bold text-red-700">Due Date:</span>{" "}
            {invoice.dueDate}
          </p>
        </div>
      </div>

      {/* Client and Invoice Info */}
      <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded border mb-6">
        <div>
          <p className="font-bold text-red-700">Client Information</p>
          <p>
            <strong>Name:</strong> {client.name}
          </p>
          <p>
            <strong>Address:</strong> {client.address}
          </p>
          <p>
            <strong>Phone:</strong> {client.phone}
          </p>
          <p>
            <strong>Mobile:</strong> {client.mobile}
          </p>
        </div>
        <div>
          <p className="font-bold text-red-700">Invoice Details</p>
          <p>
            <strong>Delivery Date:</strong> {invoice.deliveryDate}
          </p>
          <p>
            <strong>Payment Type:</strong> {invoice.paymentType}
          </p>
          <p>
            <strong>Payment Method:</strong> {invoice.paymentMethod}
          </p>
          <p>
            <strong>Currency:</strong> {invoice.currency}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <table className="w-full border">
        <thead>
          <tr className="border-black bg-red-700 text-white">
            <th className="p-2">Product</th>
            <th className=" p-2">Quantity</th>
            <th className=" p-2">Description</th>
            <th className=" p-2">Unit Price</th>
            <th className=" p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.quantity}</td>
              <td className="border p-2">{p.description}</td>
              <td className="border p-2">${p.unitPrice.toFixed(2)}</td>
              <td className="border p-2">${p.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className=" col-2 pt-4">
      <p>
        <strong>Total in words:</strong> Seven thousand eight hundred
        eighty-eight pesos MXN
      </p>

      {/* Totals */}
      <div className=" text-right space-y-2">
        <p>
          <strong>Subtotal:</strong> ${subtotal.toFixed(2)}
        </p>
        <p>
          <strong>VAT (16%):</strong> ${vat.toFixed(2)}
        </p>
        <p className="text-lg font-bold text-red-700">
          <strong>Total:</strong> ${total.toFixed(2)}
        </p>
      </div>
      </div>

      
    </div>
  );
};

export default Invoice;
