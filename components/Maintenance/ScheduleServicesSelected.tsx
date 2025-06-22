import { ScheduleServicesSelectedType } from "@/Types/Maintenance/schedule";

const ScheduleServicesSelected = ({
  services,
  selectedServices,
  total,
}: ScheduleServicesSelectedType) => {
  return (
    <div className="bg-white text-black p-4 rounded-xl border border-red-500">
      <p className="text-lg font-semibold mb-2 text-red-600">
        Selected Services:
      </p>
      <ul className="space-y-1">
        {services
          .filter((s) => selectedServices.includes(s.name))
          .map((s) => (
            <li key={s.name} className="flex justify-between">
              <span>{s.name}</span>
              <span>${s.price.toFixed(2)}</span>
            </li>
          ))}
      </ul>
      <hr className="my-2 border-red-400" />
      <p className="font-bold text-lg text-red-700">
        Total: ${total.toFixed(2)}
      </p>
    </div>
  );
};

export default ScheduleServicesSelected;
