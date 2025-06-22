import ListSchedule from "./ListSchedule";

type Client = {
  client_id: string;
  first_name: string;
};

type ScheduleClientSelection = {
  client: string;
  setClient: (val: string) => void;
  car: string;
  setCar: (val: string) => void;
  setStep: (step: number) => void;
  clients: Client[];
};

const Schedule = ({
  setClient,
  client,
  setCar,
  car,
  setStep,
  clients,
}: ScheduleClientSelection) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-red-700 font-semibold text-lg mb-2">
          Selecciona un cliente
        </h2>
        <ListSchedule values={clients} setValue={setClient} value={client} />
      </div>

      <div>
        <h2 className="text-red-700 font-semibold text-lg mb-2">
          Selecciona un auto
        </h2>
        <ListSchedule
          values={["Toyota Corolla", "Honda Civic"]}
          setValue={setCar}
          value={car}
        />
      </div>

      <div className="text-right">
        <button
          onClick={() => setStep(2)}
          disabled={!client || !car}
          className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 px-6 py-3 rounded-xl text-white disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Schedule;
