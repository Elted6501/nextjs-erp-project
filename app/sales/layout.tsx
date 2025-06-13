import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Sales",
  description: "Sales layout with sidebar and navbar",
};

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
