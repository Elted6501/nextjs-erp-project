"use client";
import { useState, useEffect } from "react";
import DynamicTable from "@/components/DynamicTable";
import styles from "@/app/finance/page.module.css";
import Button from "@/components/Button";
import { FaArrowRight, FaFileExcel, FaClipboardCheck } from "react-icons/fa";
import Dropdown from "@/components/Dropdown";
import toExcel from "@/lib/xlsx/toExcel";

const columns = [
  { key: "id", label: "Invoice ID", type: "text" },
  { key: "client_name", label: "Client Name", type: "text" },
  { key: "client_email", label: "Client Email", type: "text" },
  { key: "sale_date", label: "Sale Date", type: "text" },
  { key: "products", label: "Products", type: "text" },
  { key: "invoice_status", label: "Status", type: "text" },
  { key: "invoice_due_date", label: "Due Date", type: "text" },
  { key: "invoice_created", label: "Created Date", type: "text" },
  { key: "actions", label: "Actions", type: "action" },
];
const INVOICE_STATUS_OPTIONS = [
  { label: "Issued", value: "Issued" },
  { label: "Not Issued", value: "Not issued" },
  { label: "In progress", value: "In progress" },
  { label: "Returned", value: "Returned" },
];
type InvoiceData = {
  id: string;
  invoice_status: string;
  invoice_due_date: string;
  invoice_created: string;
  client_name: string;
  client_email: string;
  client_address: string;
  client_phone: string;
  sale_id: string;
  payment_method: string;
  sale_date: string;
  vat: string;
  products: string;
  quantity: string;
  suppliers: string;
};

export default function FinancePage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [filteredData, setFilteredData] = useState<InvoiceData[]>([]);
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/finance/invoices")
      .then((res) => res.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedData = data.map((invoices: any) => ({
          id: invoices.invoice_id,
          invoice_status: invoices.invoice_status,
          invoice_due_date: invoices.invoice_due_date,
          invoice_created: invoices.invoice_created,
          client_name: invoices.client_name,
          client_email: invoices.client_email,
          client_address: invoices.client_address,
          client_phone: invoices.client_phone,
          sale_id: invoices.sale_id,
          payment_method: invoices.payment_method,
          sale_date: invoices.sale_date,
          vat: invoices.vat,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          products: invoices.products.map((product: any) => product.product_name).join(", "),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          quantity: invoices.products.map((product: any) => product.quantity).join(", "),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          suppliers: invoices.products.map((product: any) => product.supplier_name).join(", "),
        }));
        setInvoices(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching invoices:", error);
      });
  }, []);

  const handleExportExcel = async () => {
    const sheetName = "Invoices Report";
    const content = invoices.map((invoice: InvoiceData) => ({
      id: invoice.id,
      invoice_status: invoice.invoice_status,
      invoice_due_date: invoice.invoice_due_date,
      invoice_created: invoice.invoice_created,
      client_name: invoice.client_name,
      client_email: invoice.client_email,
      client_address: invoice.client_address,
      client_phone: invoice.client_phone,
      sale_id: invoice.sale_id,
      payment_method: invoice.payment_method,
      sale_date: invoice.sale_date,
      vat: invoice.vat,
      products: invoice.products,
      quantity: invoice.quantity,
      suppliers: invoice.suppliers,
    }));

    const columns = [
      { label: "Invoice ID", value: "id" },
      { label: "Status", value: "invoice_status" },
      { label: "Due Date", value: "invoice_due_date" },
      { label: "Created Date", value: "invoice_created" },
      { label: "Client Name", value: "client_name" },
      { label: "Client Email", value: "client_email" },
      { label: "Client Address", value: "client_address" },
      { label: "Client Phone", value: "client_phone" },
      { label: "Sale ID", value: "sale_id" },
      { label: "Payment Method", value: "payment_method" },
      { label: "Sale Date", value: "sale_date" },
      { label: "VAT", value: "vat" },
      { label: "Products", value: "products" },
      { label: "Quantity", value: "quantity" },
      { label: "Suppliers", value: "suppliers" },
    ];

    try {
      await toExcel(sheetName, columns, content);
      alert("Excel file created successfully");
    } catch (error) {
      console.error("Error creating Excel file:", error);
      alert("Failed to create Excel file");
    }
  };

  const handleStatusSelect = (value: string) => {
    setStatus(value);
  };

  useEffect(() => {
    let data = invoices;

    if (status) {
      data = data.filter((item) => item.invoice_status.includes(status));
    }

    if (description) {
      data = data.filter((item) => item.id.toString().includes(description.toString()));
    }

    setFilteredData(data);
  }, [status, description, invoices]);

  return (
    <main className={`${styles.div_principal}`}>
      <div className={`${styles.div_principal_top} flex gap-2 mb-6 items-center`}>
        <div className={`${styles.div_busqueda} gap-y-3 flex items-center w-full`}>
          <label className="text-2xl text-[#8b0f14] font-bold" style={{ alignSelf: "flex-start" }}>
            Orders
          </label>
          <div className={"{$styles.div_hijo_busqueda} flex justify-between items-center w-full"}>
            <div className="flex gap-4 items-center w-full max-w-4xl">
              <input
                type="text"
                placeholder="Search by Order ID or Client name"
                className="w-[400px] px-4 border rounded-lg focus:outline-none focus:ring-2 bg-white border-[#a01217] focus:ring-[#a01217] text-black h-[37px]"
                value={description}
                onFocus={() => {
                  setStatus("");
                }}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Dropdown options={INVOICE_STATUS_OPTIONS} onSelect={handleStatusSelect} placeholder={status === "" ? "Select status" : status} />
            </div>
            <div>
              <Button
                label={
                  <div className="flex items-center justify-center gap-2 w-full h-full">
                    <FaFileExcel className="w-4 h-4" />
                    <span>Excel</span>
                  </div>
                }
                className="bg-[#a01217] text-white hover:bg-[#8b0f14] transition-colors px-4 h-[37px] rounded-lg flex items-center justify-center"
                onClick={handleExportExcel}
              />
            </div>
          </div>
        </div>
      </div>

      <DynamicTable
        data={status || description ? filteredData : invoices}
        columns={columns}
        actionIcons={{
          icon1: <FaArrowRight className="w-5 h-5" />,
          icon2: <FaClipboardCheck className="w-5 h-5" />,
        }}
        actions={{
          view: true,
          accept: true,
          cancel: false,
        }}
      />
    </main>
  );
}
