"use client";

import React, { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/input";
import Dropdown from "@/components/Dropdown";

export default function CreateOrderPage() {
  const [formData, setFormData] = useState({
    id_client: "",
    name: "",
    product_category: "",
    product: "",
    supplier: "",
    quantity: "",
    description: "",
  });

  const categoryOptions = [
    { label: "Hardware", value: "hardware" },
    { label: "Software", value: "software" },
  ];

  const productOptions = [
    { label: "Monitor", value: "monitor" },
    { label: "Laptop", value: "laptop" },
  ];

  const supplierOptions = [
    { label: "Dell", value: "dell" },
    { label: "HP", value: "hp" },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Order submitted:", formData);
    // Aquí puedes hacer fetch('/api/orders', { method: 'POST', ... })
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-xl mt-10">
      <h1 className="text-2xl font-bold mb-6 text-[#a01217]">Create Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="ID Client"
            name="id_client"
            value={formData.id_client}
            onChange={handleChange}
            required
          />
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        {/* Categoría */}
        <div className="flex flex-row gap-3 flex-wrap ">
          <div className="flex flex-col gap-1 ">
            <label
              htmlFor="product_category"
              className="text-sm font-medium text-[#a01217]"
            >
              Product Category
            </label>
            <Dropdown
              options={categoryOptions}
              placeholder="Select category"
              onSelect={(value) =>
                setFormData((prev) => ({ ...prev, product_category: value }))
              }
              defaultValue={formData.product_category}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="supplier"
              className="text-sm font-medium text-[#a01217]"
            >
              Supplier
            </label>
            <Dropdown
              options={supplierOptions}
              placeholder="Select supplier"
              onSelect={(value) =>
                setFormData((prev) => ({ ...prev, supplier: value }))
              }
              defaultValue={formData.supplier}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="product"
              className="text-sm font-medium text-[#a01217]"
            >
              Product
            </label>
            <Dropdown
              options={productOptions}
              placeholder="Select product"
              onSelect={(value) =>
                setFormData((prev) => ({ ...prev, product: value }))
              }
              defaultValue={formData.product}
            />
          </div>

          <div style={{ width: "22%"}}>
            <Input
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="pz"
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="description"
            className="text-sm font-medium text-[#a01217]"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg border-[#a01217] focus:ring-2 focus:ring-[#a01217]"
            placeholder="Add a description..."
          />
        </div>

        {/* Botón */}
        <div className="text-right">
          <Button label="Create" />
        </div>
      </form>
    </div>
  );
}
