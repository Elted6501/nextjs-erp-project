import MechanicsSchedule from "./MechanicsSchedule";
import ScheduleServicesSelected from "./ScheduleServicesSelected";
import ServicesSchedule from "./ServicesSchedule";

type Service = { name: string; price: number };

type ScheduleServicesType = {
  setStep: (step: number) => void;
  mechanic: string;
  setMechanic: (val: string) => void;
  total: number;
  selectedServices: string[];
  setSelectedServices: (services: string[]) => void;
  mechanics: any[];
};

const ScheduleServices = ({
  setStep,
  mechanic,
  setMechanic,
  total,
  selectedServices,
  setSelectedServices,
  mechanics,
}: ScheduleServicesType) => {
  const services: Service[] = [
    { name: "Oil Change", price: 29.99 },
    { name: "Brake Inspection", price: 49.99 },
    { name: "Engine Diagnostic", price: 89.99 },
    { name: "Tire Rotation", price: 19.99 },
  ];

  return (
    <div className="space-y-6">
      <ServicesSchedule
        selectedServices={selectedServices}
        setSelectedServices={setSelectedServices}
        services={services}
      />
      <MechanicsSchedule
        mechanic={mechanic}
        mechanics={mechanics}
        setMechanic={setMechanic}
      />
      <ScheduleServicesSelected
        selectedServices={selectedServices}
        services={services}
        total={total}
      />
      <button
        onClick={() => setStep(3)}
        disabled={selectedServices.length === 0}
        className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 px-6 py-3 rounded-xl text-white disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default ScheduleServices;
