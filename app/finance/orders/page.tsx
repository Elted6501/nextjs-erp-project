"use client";
import { useRouter } from "next/navigation";

import DynamicTable from "@/components/DynamicTable";
import styles from "@/app/finance/page.module.css";
import Button from "@/components/Button";
import { FaPlus } from "react-icons/fa";

const columns = [
  { key: "order_id", label: "Order ID", type: "text" },
  { key: "client", label: "Client", type: "text" },
  { key: "suplier", label: "Suplier", type: "text" },
  { key: "quantity", label: "Quantity", type: "text" },
  { key: "description", label: "Description", type: "text" },
  { key: "status", label: "Status", type: "text" },
  { key: "date", label: "Date", type: "text" },
];

const data = [
  {
    id: "P001",
    order_id: "P001",
    client: "Mariann Valdez",
    suplier: "supplier1",
    quantity: 100,
    description: "LED Lights",
    date: "2025-06-01",
    status: "active",
  },
  {
    id: "P002",
    order_id: "P002",
    client: "John Doe",
    suplier: "supplier2",
    quantity: 20,
    description: "Wheels",
    date: "2025-06-02",
    status: "inactive",
  },
  {
    id: "P003",
    order_id: "P003",
    client: "Jane Smith",
    suplier: "supplier3",
    quantity: 10,
    description: "Tires",
    date: "2025-06-03",
    status: "active",
  },
];

export default function OrdersPage() {
  const router = useRouter();
  return (
    <main className={`${styles.div_principal} gap-2 flex flex-col`}>
      <div className={` flex items-end gap-2 flex-row `}>
        <Button
          label={
            <div className="flex items-center gap-2">
              <FaPlus className="w-4 h-4" />
              <span> New Order </span>
            </div>
          }
          className="bg-[#a01217] text-white hover:bg-[#8b0f14] transition-colors p-2 w-fit h-fit"
          onClick={() => router.push("/finance/orders/create")}
        />
      </div>
      <DynamicTable data={data} columns={columns} />
    </main>
  );
}
