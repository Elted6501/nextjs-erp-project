"use client";

import { FaArrowRight } from "react-icons/fa";
import { FaDollarSign } from "react-icons/fa";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { FaClipboardCheck } from "react-icons/fa6";
import { FaHandHoldingUsd } from "react-icons/fa";


import Card from "@/components/Card";
  

import { useRouter } from "next/navigation";
export default function FinancePage() {
  const router = useRouter();

  return (
    <main className={`justify-center items-center p-6 `}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          icon={<FaDollarSign className="w-10 h-10" />}
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
        <Card
          icon={<FaHandHoldingUsd className="w-10 h-10" />}
          label="Payments Due"
          buttonLabel={
            <div className="flex items-center gap-2">
              <FaArrowRight className="w-4 h-4" />
              <span>View Details</span>
            </div>
          }
          onButtonClick={() => router.push("/finance/payments-due")}
        />
      </div>
    </main>
  );
}
