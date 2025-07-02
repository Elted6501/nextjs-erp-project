"use client";
import { useState, useEffect } from "react";
import DynamicTable from "@/components/DynamicTable";
import styles from "@/app/finance/page.module.css";
import Button from "@/components/Button";
import { FaCheck, FaEye, FaTimes, FaFileExcel } from "react-icons/fa";
import Dropdown from "@/components/Dropdown";
import toExcel from "@/lib/xlsx/toExcel";

const columns = [
  { key: "id", label: "Order ID", type: "text" },
  { key: "client", label: "Client", type: "text" },
  { key: "products", label: "Products", type: "text" },
  { key: "status", label: "Status", type: "text" },
  { key: "date", label: "Date", type: "text" },
  { key: "actions", label: "Actions", type: "action" },
];
const ORDER_STATUS_OPTIONS = [
  { label: "Pending", value: "Pending" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Confirmed", value: "Confirmed" },
];

type OrderData = {
  id: string;
  client: string;
  products: string;
  quantity: string;
  status: string;
  date: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filteredData, setFilteredData] = useState<OrderData[]>([]);
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/finance/orders")
      .then((res) => res.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedData = data.map((order: any) => ({
          id: order.order_id, // Assuming order_id is the unique identifier
          client: order.client_name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          products: order.products.map((product: any) => product.product_name).join(", "), // Join product names
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          quantity: order.products.map((product: any) => product.quantity).join(", "), // Join quantities
          status: order.status,
          date: order.order_date,
        }));
        setOrders(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      });
  }, [status, description]);

  const handleExportExcel = async () => {
    const sheetName = "Orders Report";
    const content = orders.map((order: OrderData) => ({
      id: order.id,
      client: order.client,
      products: order.products,
      quantity: order.quantity,
      status: order.status,
      date: order.date,
    }));

    const columns = [
      { label: "Order ID", value: "id" },
      { label: "Client", value: "client" },
      { label: "Products", value: "products" },
      { label: "Quantity", value: "quantity" },
      { label: "Status", value: "status" },
      { label: "Date", value: "date" },
    ];

    try {
      await toExcel(sheetName, columns, content);
      alert("Excel file created successfully");
    } catch (error) {
      console.error("Error creating Excel file:", error);
      alert("Failed to create Excel file");
    }
  };

  useEffect(() => {
    let data = orders;

    if (status) {
      data = data.filter((item) => item.status.includes(status));
    }
    if (description) {
      const dataId = data.filter((item) => item.id.toString().includes(description.toString()));
      const dataClient = data.filter((item) => item.client.toLowerCase().includes(description.toLowerCase()));
      data = [...dataId, ...dataClient];
    }

    setFilteredData(data);
  }, [status, description, orders]);

  const handleStatusSelect = (value: string) => {
    setDescription("");
    setStatus(value);
  };

  return (
    <main className={`${styles.div_principal} gap-2 flex flex-col`}>
      <div className={`${styles.div_principal_top} flex gap-2 mb-6 items-center`}>
        <div className={`${styles.div_busqueda} gap-y-3 flex items-center w-full`}>
          <label className="text-2xl text-[#8b0f14] font-bold" style={{ alignSelf: "flex-start" }}>
            Orders
          </label>
          <div className={'{$styles.div_hijo_busqueda} flex justify-between items-center w-full'} >
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
            <Dropdown options={ORDER_STATUS_OPTIONS} onSelect={handleStatusSelect} placeholder={status === "" ? "Select status" : status} />
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
        data={status || description ? filteredData : orders}
        columns={columns}
        actionIcons={{
          icon1: <FaEye className="w-5 h-5" />,
          icon2: <FaCheck className="w-5 h-5" />,
          icon3: <FaTimes className="w-5 h-5" />,
        }}
      />
    </main>
  );
}
