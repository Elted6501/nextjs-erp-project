"use client";
import { useState, useEffect } from "react";
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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/finance/orders")
      .then((res) => res.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedData = data.map((order: any) => ({
          order_id: order.order_id,
          client: order.client_name,
          suplier: order.name,
          quantity: order.quantity,
          description: order.description,
          status: order.status,
          date: order.order_date,
        }));
        setOrders(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      });
  }, []);

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
      <DynamicTable data={orders} columns={columns} />
    </main>
  );
}
