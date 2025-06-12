"use client";

import { useRouter } from "next/navigation";
import { CalendarClock, History, LocateFixed } from "lucide-react";
import { motion } from "framer-motion";

const cards = [
  {
    title: "Schedule",
    description: "Book a new service appointment",
    icon: CalendarClock,
    href: "/maintenance/schedule",
  },
  {
    title: "Tracking",
    description: "Track ongoing service progress",
    icon: LocateFixed,
    href: "/maintenance/tracking",
  },
  {
    title: "History",
    description: "View past service records",
    icon: History,
    href: "/maintenance/history",
  },
];

export default function MaintenanceHome() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {cards.map(({ title, description, icon: Icon, href }) => (
          <motion.div
            key={title}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl shadow-md p-6 cursor-pointer border-4 border-transparent hover:border-red-500 transition"
            onClick={() => router.push(href)}
          >
            <Icon className="w-12 h-12 text-red-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-2">{description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
