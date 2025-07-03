import MechanicsSchedule from "./MechanicsSchedule";
import ScheduleServicesSelected from "./ScheduleServicesSelected";
import ServicesSchedule from "./ServicesSchedule";
import {ScheduleServicesType } from "@/Types/Maintenance/schedule";

const ScheduleServices = ({setStep,  mechanic,  setMechanic,  total,  selectedServices,  setSelectedServices,  mechanics,  services}: ScheduleServicesType) => {

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
