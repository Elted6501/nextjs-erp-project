"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DynamicTable from "@/components/DynamicTable";
import styles from "@/app/finance/page.module.css";
import Button from "@/components/Button";
import { FaCheck, FaEye, FaTimes, FaFileExcel } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import Dropdown from "@/components/Dropdown";

const columns = [
  { key: "id", label: "Order ID", type: "text" },
  { key: "client", label: "Client", type: "text" },
  { key: "suplier", label: "Suplier", type: "text" },
  { key: "quantity", label: "Quantity", type: "text" },
  { key: "description", label: "Description", type: "text" },
  { key: "status", label: "Status", type: "text" },
  { key: "date", label: "Date", type: "text" },
  { key: "actions", label: "Actions", type: "action" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    fetch("/api/finance/orders")
      .then((res) => res.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedData = data.map((order: any) => ({
          id: order.order_id, // Assuming order_id is the unique identifier
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

  const handleView = (id: string) => {
    router.push(`/finance/pending-to-pay/${id}`);
  };

  const handleAccept = (id: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de aceptar la fila " + id + "?"
    ); //Aqui se pondra la validacion para aceptar la fila, cambia estatus a Accepted
    if (confirmed) {
    }
  };

  const handleCancel = (id: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de cancelar la fila " + id + "?"
    ); //Aqui se pondra la validacion para cancelar la fila, cambia estatus a Canceled
    if (confirmed) {
    }
  };

  return (
    <main className={`${styles.div_principal} gap-2 flex flex-col`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#a01217] mb-4">Orders</h1>
        <div className="flex gap-2">
          <Button
            label={
              <div className="flex items-center gap-2">
                <IoFilter className="w-4 h-4" />
                <span>Filters </span>
              </div>
            }
            className="bg-[#a01217] text-white hover:bg-[#8b0f14] transition-colors p-2 w-fit h-fit"
            onClick={() => setShowButton(!showButton)}
          />
          <Button
            label={
              <div className="flex items-center gap-2">
                <FaFileExcel className="w-4 h-4" />
                <span>Excel</span>
              </div>
            }
            className="bg-[#a01217] text-white hover:bg-[#8b0f14] transition-colors p-2 w-fit h-fit"
          />
        </div>
      </div>

      {showButton && (
        <div className="border border-[#a01217] p-4 rounded-lg flex gap-4 ">
          <Dropdown
            placeholder="Status"
            options={[
              { label: "Pending", value: "pending" },
              { label: "Paid", value: "paid" },
              { label: "Cancelled", value: "cancelled" },
            ]}
            onSelect={(value) => console.log("Selected client:", value)}
            className="w-52"
          />
          <Dropdown
            placeholder="Select Client"
            options={[
              { label: "Client 1", value: "client1" },
              { label: "Client 2", value: "client2" },
              { label: "Client 3", value: "client3" },
            ]}
            onSelect={(value) => console.log("Selected client:", value)}
            className="w-52"
          />
          <Dropdown
            placeholder="Select Client"
            options={[
              { label: "Client 1", value: "client1" },
              { label: "Client 2", value: "client2" },
              { label: "Client 3", value: "client3" },
            ]}
            onSelect={(value) => console.log("Selected client:", value)}
            className="w-52"
          />
        </div>
      )}

      <DynamicTable
        data={orders}
        columns={columns}
        actionHandlers={{
          onView: handleView,
          onAccept: handleAccept,
          onCancel: handleCancel,
        }}
        actionIcons={{
          icon1: <FaEye className="w-5 h-5" />,
          icon2: <FaCheck className="w-5 h-5" />,
          icon3: <FaTimes className="w-5 h-5" />,
        }}
      />
      
    </main>
  );
}
