"use client";

import { useState } from "react";
import {
  FaCalendarCheck,
  FaCarSide,
  FaCheckCircle,
  FaTools,
} from "react-icons/fa";

export default function TrackingPage() {
  const [folioInput, setFolioInput] = useState("");
  const [folio, setFolio] = useState("");
  const [status, setStatus] = useState<
    "Scheduled" | "In Progress" | "Waiting for Pickup" | "Completed" | null
  >(null);
  const [isEditing, setIsEditing] = useState(false);

  const statusSteps = [
    { label: "Scheduled", icon: <FaCalendarCheck className="text-xl" /> },
    { label: "In Progress", icon: <FaTools className="text-xl" /> },
    { label: "Waiting for Pickup", icon: <FaCarSide className="text-xl" /> },
    { label: "Completed", icon: <FaCheckCircle className="text-xl" /> },
  ];

  const currentIndex = status
    ? statusSteps.findIndex((s) => s.label === status)
    : -1;

  const progressWidth = ((currentIndex + 0.5) / (statusSteps.length - 1)) * 100;

  // Simula consulta de status por folio
  const handleCheckStatus = () => {
    if (folioInput.trim() !== "") {
      setFolio(folioInput);
      // Aquí puedes hacer fetch por folio y traer el status
      // Por ahora, se simula con un estado por defecto
      setStatus("Scheduled");
    }
  };

  const handleSaveStatus = () => {
    console.log("Nuevo status guardado:", status);
    setIsEditing(false);
  };

  return (
    <main
      className="min-h-screen px-6 py-10 text-black"
      style={{ backgroundColor: "#ecebeb" }}
    >
      <div className="max-w-2xl mx-auto p-8 rounded-xl shadow space-y-8 border border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-red-600 text-center">
          Appointment Tracking
        </h1>

        {/* Formulario para ingresar folio */}
        {!folio && (
          <div className="space-y-4">
            <label className="block text-gray-600 font-medium">
              Enter your folio
            </label>
            <input
              type="text"
              value={folioInput}
              onChange={(e) => setFolioInput(e.target.value)}
              placeholder="Ej. ABC123456"
              className="w-full bg-gray-100 border border-gray-300 p-3 rounded-lg"
            />
            <button
              onClick={handleCheckStatus}
              className="bg-red-700 text-white px-6 py-3 rounded-lg w-full hover:bg-red-900"
            >
              Check Status
            </button>
          </div>
        )}

        {/* Mostrar tracking si ya hay folio */}
        {folio && status && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-700">
              Folio: <span className="font-mono text-black">{folio}</span>
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
                      className={`w-14 h-14 flex items-center justify-center rounded-full border-4 mb-2 transition-colors duration-300 ${
                        isActive
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

            <div className="flex justify-center">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
              >
                Update Status
              </button>
            </div>
          </div>
        )}

        {/* Formulario para actualizar status */}
        {isEditing && (
          <div className="space-y-6 pt-6 border-t border-gray-300">
            <h3 className="text-lg font-semibold text-center text-gray-700">
              Update Status for: {folio}
            </h3>

            <div>
              <label className="block mb-1 text-gray-600 font-medium">
                Select new status
              </label>
              <select
                value={status || ""}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full bg-gray-100 border border-gray-300 p-3 rounded-lg"
              >
                <option value="">-- Select Status --</option>
                {statusSteps.map((step) => (
                  <option key={step.label} value={step.label}>
                    {step.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleSaveStatus}
                disabled={!status}
                className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-900 disabled:opacity-50"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
