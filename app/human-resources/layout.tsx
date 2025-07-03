import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

// Metadata for the Human Resources layout
export const metadata: Metadata = {
  title: "Human-Resources", // Title shown in the browser tab and SEO
  description: "Human-Resources layout with sidebar and navbar", // Description for SEO and page context
};

// Layout component for all /human-resources pages
export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Main container with sidebar and navbar
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar navigation for HR module */}
      <Sidebar />
      {/* Main content area with navbar on top */}
      <div className="flex flex-col flex-1">
        <Navbar />
        {/* Page content goes here */}
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
