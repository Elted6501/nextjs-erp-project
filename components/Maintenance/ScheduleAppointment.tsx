import Calendar from "./CalendarComponent";
import ScheduleAvailableTimes from "./ScheduleAvailableTimes";

type ScheduleAppointmentType = {
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  setStep: (step: number) => void;
};

const ScheduleAppointment = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  setStep,
}: ScheduleAppointmentType) => {
  const handleNext = () => {
    if (!selectedDate) {
      alert("Por favor selecciona una fecha");
      return;
    }
    if (!selectedTime) {
      alert("Por favor selecciona una hora");
      return;
    }
    setStep(4);
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Calendar selected={selectedDate} onSelect={setSelectedDate} />
        <ScheduleAvailableTimes
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />
      </div>

      <button
        onClick={handleNext}
        className="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700 transition"
      >
        Guardar y continuar
      </button>
    </div>
  );
};

export default ScheduleAppointment;
