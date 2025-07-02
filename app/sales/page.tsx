"use client";
import { FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";

export default function SalesPage() {
  const router = useRouter();

  return (
    <main className="justify-center items-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          label="Purchases"
          buttonLabel={
            <div className="flex items-center gap-2">
              <FaArrowRight className="w-4 h-4" />
              <span>View Details</span>
            </div>
          }
          onButtonClick={() => router.push("/sales/purchases")}
        />
        <Card
          label="Returns"
          buttonLabel={
            <div className="flex items-center gap-2">
              <FaArrowRight className="w-4 h-4" />
              <span>View Details</span>
            </div>
          }
          onButtonClick={() => router.push("/sales/returns")}
        />
        <Card
          label="Client registration"
          buttonLabel={
            <div className="flex items-center gap-2">
              <FaArrowRight className="w-4 h-4" />
              <span>View Details</span>
            </div>
          }
          onButtonClick={() => router.push("/sales/clients")}
        />
        <Card
          label="Sales History"
          buttonLabel={
            <div className="flex items-center gap-2">
              <FaArrowRight className="w-4 h-4" />
              <span>View Details</span>
            </div>
          }
          onButtonClick={() => router.push("/sales/history")}
        />
      </div>
    </main>
  );
}