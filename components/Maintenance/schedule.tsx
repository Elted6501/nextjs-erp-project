import React, { Dispatch, SetStateAction } from 'react';
import Inputs from '@/components/Maintenance/Inputs';

function Schedule({  client,  setClient,  setCar,  setStep,}: {
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
        <Inputs placeholder='Ej. Juan Pérez' setValue={setClient} value={client} title='Name of the client' />
        <Inputs placeholder='Ej. Toyota' setValue={setBrand} value={brand} title='Brand of the car' />
        <Inputs placeholder='Ej. Corolla' setValue={setModel} value={model} title='Model of the car' />
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
        <Inputs placeholder='Ej. ABC123' setValue={setPlates} value={plates} title='Plates' />
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