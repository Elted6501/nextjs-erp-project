"use client";
import {
  FaArrowRight,
  FaFileExcel,
  FaHandHoldingUsd /* FaDollarSign, */,
} from "react-icons/fa";
import { /*FaFileInvoiceDollar*/ FaClipboardCheck } from "react-icons/fa6";
import { IoFilter } from "react-icons/io5";
import { useRouter } from "next/navigation";

import Card from "@/components/Card";
import DynamicTable from "@/components/DynamicTable";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";

const columns = [
  { key: "order_id", label: "Order ID", type: "text" },
  { key: "client", label: "Client", type: "text" },
  { key: "suplier", label: "Suplier", type: "text" },
  { key: "quantity", label: "Quantity", type: "text" },
  { key: "description", label: "Description", type: "text" },
  { key: "status", label: "Status", type: "text" },
  { key: "date", label: "Date", type: "text" },
];

export default function FinancePage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [showButton, setShowButton] = useState(false);

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
    <main className={`justify-center items-center p-6 `}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          icon={<FaHandHoldingUsd className="w-10 h-10" />}
          label="Pending to Pay"
          buttonLabel={
            <div className="flex items-center gap-2">
              <FaArrowRight className="w-4 h-4" />
              <span>View Details</span>
            </div>
          }
          onButtonClick={() => router.push("/finance/pending-to-pay")}
        />
        <Card
          icon={<FaClipboardCheck className="w-10 h-10" />}
          label="Orders"
          buttonLabel={
            <div className="flex items-center gap-2">
              <FaArrowRight className="w-4 h-4" />
              <span>View Details</span>
            </div>
          }
          onButtonClick={() => router.push("/finance/orders")}
        />
        {/* <Card
          icon={<FaFileInvoiceDollar className="w-10 h-10" />}
          label="Invoices"
          buttonLabel={
            <div className="flex items-center gap-2">
              <FaArrowRight className="w-4 h-4" />
              <span>View Details</span>
            </div>
          }
          onButtonClick={() => router.push("/finance/invoices")}
        />
        { <Card
          icon={<FaHandHoldingUsd className="w-10 h-10" />}
          label="Payments Due"
          buttonLabel={
            <div className="flex items-center gap-2">
              <FaArrowRight className="w-4 h-4" />
              <span>View Details</span>
            </div>
          }
          onButtonClick={() => router.push("/finance/payments-due")}
        /> */}
      </div>
      <div className="mt-10 mb-6 items-end gap-2">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#a01217] mb-4">Invoices</h1>
          <div className="flex gap-2">
            <Button
              label={
              <div className="flex items-center gap-2">
                <IoFilter className="w-4 h-4" />
                <span>Filter Invoices</span>
              </div>}
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

            {/* ESTE BOTON SE VA A BORRAR SOLO ES PARA PROBAR COMO SE VE EL REPORTE DE UNA FACTURA */}
            <Button
              label={
                <div className="flex items-center gap-2">
                  <FaArrowRight className="w-4 h-4" />
                  <span>Prueba invoices</span>
                </div>
              }
              className="bg-[#a01217] text-white hover:bg-[#8b0f14] transition-colors p-2 w-fit h-fit"
              onClick={() => router.push("/finance/invoices")}
            />  
          </div>
        </div>

        {showButton && (
          <div className="mt-4 border border-[#a01217] p-4 rounded-lg flex gap-4 ">
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

        <div className="mt-6 mb-4">
        <DynamicTable data={orders} columns={columns} />
        </div>
      </div>
    </main>
  );
}
