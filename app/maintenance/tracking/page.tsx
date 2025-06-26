"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaCalendarCheck,
  FaCarSide,
  FaCheckCircle,
  FaTools,
} from "react-icons/fa";

export default function TrackingPage() {
  const [folio, setFolio] = useState("");
  const [status, setStatus] = useState<
    "Scheduled" | "In Progress" | "Waiting for Pickup" | "Completed" | null
  >(null);

  const router = useRouter();

  const handleSearch = async () => {
    const response = await fetch("../api/maintenance/tracking/maintenance?folio=" + folio.toString());
    const data = await response.json();

    setStatus(data.data[0].status);
  };

  const statusSteps = [
    { label: "Scheduled", icon: <FaCalendarCheck className="text-xl" /> },
    { label: "In Progress", icon: <FaTools className="text-xl" /> },
    { label: "Waiting for Pickup", icon: <FaCarSide className="text-xl" /> },
    { label: "Completed", icon: <FaCheckCircle className="text-xl" /> },
  ];

  const currentIndex = statusSteps.findIndex((s) => s.label === status);
  const progressWidth = ((currentIndex + 0.5) / (statusSteps.length - 1)) * 100;

  return (
    <main
      className="min-h-screen px-6 py-10 text-black"
      style={{ backgroundColor: "#ecebeb" }}
    >
      <div className="max-w-2xl mx-auto p-8 rounded-xl shadow space-y-8 border border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-red-600 text-center">
          Appointment tracking
        </h1>

        {!status && (
          <div className="space-y-6">
            <div>
              <label className="block mb-1 text-gray-500 font-medium">
                Digit your folio
              </label>
              <input
                type="text"
                placeholder="Ej. ABC123456"
                className="w-full bg-gray-100 text-black border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                value={folio}
                onChange={(e) => setFolio(e.target.value)}
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={!folio}
              className="bg-red-700 hover:bg-red-900 px-6 py-3 rounded-lg shadow text-white w-full disabled:opacity-40"
            >
              Search status
            </button>
          </div>
        )}

        {status && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-center text-gray-700">
              Status of your appointment
            </h2>

            <div className="relative flex items-center justify-between">
              <div className="absolute top-7 left-0 right-0 h-1">
                <div className="h-1 bg-gray-300 w-full" />
                <div
                  className="h-2 bg-red-600 absolute top-[-2px] z-20"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>

              {statusSteps.map((step, index) => {
                const isActive = index <= currentIndex;
                return (
                  <div
                    key={step.label}
                    className="relative z-30 flex flex-col items-center w-1/4"
                  >
                    <div
                      className={`w-14 h-14 flex items-center justify-center rounded-full border-4 mb-2 transition-colors duration-300 ${isActive
                        ? "border-red-500 bg-red-600 text-white"
                        : "border-gray-300 bg-gray-100 text-gray-500"
                        }`}
                    >
                      {step.icon}
                    </div>
                    <p className="text-sm text-center text-gray-700">
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-6">
              <button
                className="bg-red-700 text-white border border-red-700 px-6 py-3 rounded-lg hover:bg-red-900"
                onClick={() => router.push("/maintenance")}
              >
                Finalize
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
