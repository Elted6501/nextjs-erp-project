import React, { Dispatch, SetStateAction, useEffect } from 'react';

function Schedule({
  client,
  setClient,
  setCar,
  setStep,
}: {
  client: string;
  setClient: (value: string) => void;
  setCar: Dispatch<SetStateAction<{
    brand: string
    model: string
    year: string
    plates: string
  }>>;
  setStep: (step: number) => void;
}) {
  const [brand, setBrand] = React.useState("");
  const [model, setModel] = React.useState("");
  const [year, setYear] = React.useState("");
  const [plates, setPlates] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client || !brand || !model || !year || !plates) {
      alert("Please, fill all the fields");
      return;
    }
    setCar({ brand, model, year, plates });
    setStep(2);
  }

  return (
    <form onSubmit={handleSubmit} className="text-gray-800">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold mb-2">Name of the client</label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej. Juan Pérez"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Marca del auto</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej. Toyota"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Modelo del auto</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej. Corolla"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Año del auto</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej. 2018"
            min="1900"
            max={new Date().getFullYear()}
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block font-semibold mb-2">Placas</label>
          <input
            type="text"
            value={plates}
            onChange={(e) => setPlates(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej. ABC1234"
            required
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700 transition"
        >
          Save and continue
        </button>
      </div>
    </form>
  );
}

export default Schedule;