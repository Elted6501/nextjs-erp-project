"use client";
import { FaArrowRight,/* FaDollarSign, */ FaHandHoldingUsd } from "react-icons/fa";
import { FaFileInvoiceDollar,FaClipboardCheck } from "react-icons/fa6";
import { useRouter } from "next/navigation";

import Card from "@/components/Card";
import DynamicTable from "@/components/DynamicTable";
import { useEffect, useState } from "react";

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <Card
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
        {/* <Card
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
      <div className="mt-10 mb-6 items-end ">
        <h1 className="text-2xl font-bold text-[#a01217] mb-4">
          Payments Due
        </h1>
      <DynamicTable 
            data={orders} 
            columns={columns}
            />
      </div>
    </main>
  );
}
