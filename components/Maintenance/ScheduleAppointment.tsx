import { useState } from "react";
import Calendar from "./CalendarComponent";
import ScheduleAvailableTimes from "./ScheduleAvailableTimes";
import { CarType, Mechanic } from "@/Types/Maintenance/schedule";

type ScheduleAppointmentType = {
  selectedDate?: string;
  appointmentId: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  setStep: (step: number) => void;
  Mechanic: Mechanic
  car: CarType
  selectedServices: string[];
  assignedMechanic?: { employee_id: string | number, first_name: string, last_name: string } | null | undefined;
  client: string;

};

const ScheduleAppointment = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  setStep,
  Mechanic,
  car,
  selectedServices,
  client,
  assignedMechanic,
  appointmentId
}: ScheduleAppointmentType) => {
  const [isActive, setIsActive] = useState<boolean>(false);

  const handleNext = async () => {
    if (!selectedDate) {
      alert("Please, select a date");
      return;
    }
    if (!selectedTime) {
      alert("Please, select an hour");
      return;
    }

    if (!isActive && selectedDate && selectedTime) {
      setIsActive(true);
      const response = await fetch("../api/maintenance/schedule/maintenance", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          maintenance_folio: appointmentId,
          employee_id: assignedMechanic?.employee_id,
          status: 'Schedule',
          notes: `${car.brand} - ${car.model} - ${car.year} - ${car.plates} of ${client}. ${selectedServices.join(',')}`,
          mn_assigned: selectedDate + ' ' + selectedTime
        })
      });

      const data = await response.json();

      if (data.error) {
        console.error(data.error);
      }

    }
    setStep(4);
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Calendar selected={selectedDate} onSelect={setSelectedDate} />
        {
          selectedDate ?
            <ScheduleAvailableTimes
              mechanicSelected={Mechanic}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
            />
            :
            <></>
        }
      </div>

      <button
        onClick={handleNext}
        className="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700 transition"
      >
        Save and continue
      </button>
    </div>
  );
};

export default ScheduleAppointment;
