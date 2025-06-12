// app/page.tsx o src/pages/index.tsx
"use client"; // si usas Next.js 13+

import React, { useState } from "react";
import DateInput from "@/components/DateInput";
export default function CreateNewPendingToPayPage() {
  const [fecha, setFecha] = useState<Date | null>(null);
  return (
    <div>
      <h1>Create New Pending Payment</h1>
      <DateInput
        label="Fecha de entrega"
        selectedDate={fecha}
        onChange={(date) => setFecha(date)}
      />
      {/* Render your form here */}
    </div>
  );
}