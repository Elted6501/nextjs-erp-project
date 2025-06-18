"use client";
import Input from "@/components/input";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import DynamicTable from "@/components/DynamicTable";

import { useEffect, useState } from "react";
import { FaFileExcel, FaSearch, FaEye, FaTimes, FaRegCheckCircle, FaPlus } from "react-icons/fa";
import styles from "@/app/finance/page.module.css";
import { useRouter } from "next/navigation";

export default function PendingToPayPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [pendingToPay, setPendingToPay] = useState([]);

  const warehouseOptions = [
    { label: "Pending", value: "pending" },
    { label: "Paid", value: "paid" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const columns = [
    { key: "OrderId", label: "Order Id", type: "text" },
    { key: "Product", label: "Product", type: "text" },
    { key: "Status", label: "Status", type: "text" },
    { key: "DueDate", label: "Due Date", type: "text" },
    { key: "PayDate", label: "Pay Date", type: "text" },
    { key: "Actions", label: "Actions", type: "action" },
  ];

  useEffect(() => {
    fetch("/api/finance/pending_to_pay")
      .then((response) => response.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformData = data.map((pendingToPay: any) => ({
          id: pendingToPay.payable_id,
          OrderId: pendingToPay.order_id,
          Product: pendingToPay.name,
          Status: pendingToPay.status,
          DueDate: pendingToPay.due_date,
          PayDate: pendingToPay.payment_date,
        }));

        setPendingToPay(transformData);
      })
      .catch((error) => {
        console.error("Error fetching pending to pay data:", error);
      });
  }, []);

  const handleView = (id: string) => {
    router.push(`/finance/pending-to-pay/${id}`);
  };

  const handleAccept = (id: string) => {
    const confirmed = window.confirm("¿Estás seguro de aceptar la fila " + id + "?"); //Aqui se pondra la validacion para aceptar la fila, cambia estatus a Accepted
    if (confirmed) {
    }
  };

  const handleCancel = (id: string) => {
    const confirmed = window.confirm("¿Estás seguro de cancelar la fila " + id + "?"); //Aqui se pondra la validacion para cancelar la fila, cambia estatus a Canceled
    if (confirmed) {
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <main className={`${styles.div_principal}`}>
      <form onSubmit={handleSubmit}>
        <div className={`${styles.div_principal_top} flex gap-4 mb-6 items-center`}>
          <div className={`${styles.div_busqueda}flex mb-6 items-center `}>
            <label className="text-[#8b0f14] font-bold" style={{ alignSelf: "flex-start" }}>
              Order ID:
            </label>
            <div className={`${styles.div_hijo_busqueda}`}>
              <Input name="Search" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Id order" required />
              <Dropdown options={warehouseOptions} placeholder="Select status" />
              <Button
                label={
                  <div className="flex items-center gap-2">
                    <FaSearch className="w-4 h-4" />
                  </div>
                }
                className="bg-[#a01217] text-white hover:bg-[#8b0f14] transition-colors p-2 w-fit h-fit"
                onClick={() => alert("Search")}
              />
            </div>
          </div>

          <div className={` flex items-end gap-2 flex-row `}>
            <Button
              label={
                <div className="flex items-center gap-2">
                  <span> New Pending to pay</span>
                  <FaPlus className="w-4 h-4" />
                </div>
              }
              className="bg-[#a01217] text-white hover:bg-[#8b0f14] transition-colors p-2 w-fit h-fit"
              onClick={() => router.push("/finance/pending-to-pay/create")}
            />
            <Button
              label={
                <div className="flex items-center gap-2">
                  <FaFileExcel className="w-4 h-4" />
                  <span> Excel</span>
                </div>
              }
              className="bg-[#a01217] text-white hover:bg-[#8b0f14] transition-colors p-2 w-fit h-fit"
              onClick={() => alert("Excel")}
            />
          </div>
        </div>
      </form>

      <DynamicTable
        data={pendingToPay}
        columns={columns}
        actionHandlers={{
          onView: handleView,
          onAccept: handleAccept,
          onCancel: handleCancel,
        }}
        actionIcons={{
          icon1: <FaEye className="w-5 h-5" />,
          icon2: <FaRegCheckCircle className="w-5 h-5" />,
          icon3: <FaTimes className="w-5 h-5" />,
        }}
      />
    </main>
  );
}
