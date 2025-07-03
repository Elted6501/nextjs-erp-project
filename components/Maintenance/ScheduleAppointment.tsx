import { useState } from "react";
import Calendar from "./CalendarComponent";
import ScheduleAvailableTimes from "./ScheduleAvailableTimes";
import {  ScheduleAppointmentType } from "@/Types/Maintenance/schedule";

const ScheduleAppointment = (props: ScheduleAppointmentType) => {
  const [isActive, setIsActive] = useState<boolean>(false);

  const handleNext = async () => {
    if (!props.selectedDate) {
      alert("Please, select a date");
      return;
    }
    if (!props.selectedTime) {
      alert("Please, select an hour");
      return;
    }

    if (!isActive && props.selectedDate && props.selectedTime) {
      setIsActive(true);
      const response = await fetch("../api/maintenance/schedule/maintenance", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          maintenance_folio: props.appointmentId,
          employee_id: props.assignedMechanic?.employee_id,
          status: 'Schedule',
          notes: `${props.car.brand} - ${props.car.model} - ${props.car.year} - ${props.car.plates} of ${props.client}. ${props.selectedServices.join(',')}`,
          mn_assigned: props.selectedDate + ' ' + props.selectedTime
        })
      });

      const data = await response.json();

      if (data.error) {
        console.error(data.error);
      }

    }
    props.setStep(4);
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Calendar selected={props.selectedDate} onSelect={props.setSelectedDate} />
        {
          props.selectedDate ?
            <ScheduleAvailableTimes
              mechanicSelected={props.Mechanic}
              selectedDate={props.selectedDate}
              selectedTime={props.selectedTime}
              setSelectedTime={props.setSelectedTime}
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
