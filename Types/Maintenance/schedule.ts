import { Dispatch, JSX, SetStateAction } from "react";

export type CalendarMaintenance = {
    selected: Date | undefined;
    onSelect: React.Dispatch<React.SetStateAction<Date | undefined>>;
    fromDate?: Date;
    toDate?: Date;
};

export type CalendarProps = {
  selected?: string;
  onSelect?: (date: string) => void;
  onSelectTime?: (date: Date) => void;
  fromDate?: Date;
  toDate?: Date;
};

export type ScheduleClientSelection = {
    setClient: React.Dispatch<React.SetStateAction<string>>;
    client: string;
    setCar: React.Dispatch<React.SetStateAction<string>>;
    car: string;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    clients: clients[];
};

export type ScheduleListType = {
    setValue: React.Dispatch<React.SetStateAction<string>>;
    value: string;
    values: clients[] | string[];
};

export type clients = {
    client_id: number;
    first_name: string;
};

export type Mechanic = {
    employee_id: number;
    first_name: string;
    last_name: string;
};

export type History = {
    car: string;
    date: string;
    entryDate: string;
    exitDate: string;
    services: string[];
};

export type ScheduleServicesType = {
  setStep: (step: number) => void;
  mechanic: { employee_id: number, first_name: string, last_name: string };
  setMechanic: (val: { employee_id: number, first_name: string, last_name: string }) => void;
  total: number;
  selectedServices: string[];
  setSelectedServices: Dispatch<SetStateAction<string[]>>
  mechanics: Mechanic[];
  services: { name: string, service_price: number }[]
};

export type MechanicsScheduleType = {
    setMechanic: React.Dispatch<React.SetStateAction<string>>;
    mechanic: string;
    mechanics: Mechanic[];
};

export type ServicesScheduleType = {
    setSelectedServices: React.Dispatch<React.SetStateAction<string[]>>;
    selectedServices: string[];
    services: ServicesType[];
};

export type ServicesType = {
    name: string;
    service_price: number;
};

export type CarType = {
    brand: string
    model: string
    year: string
    plates: string
}

export type ScheduleServicesSelectedType = {
    services: ServicesType[];
    selectedServices: string[];
    total: number;
};

export type ScheduleAppointmentType = {
  selectedDate?: string;
  onSelectTime?: (value: Date) => void
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

export type ScheduleDateOnlyType = {
    selectedDate: Date;
    setSelectedDate: (value: Date) => void;
    setSelectedTime?: React.Dispatch<React.SetStateAction<string>>;
    selectedTime?: string;
    setStep?: React.Dispatch<React.SetStateAction<number>>;
}

export type ScheduleAvailableTimesType = {
    setSelectedTime: React.Dispatch<React.SetStateAction<string>>;
    selectedTime: string;
};

export type ScheduleResultsType = {
    appointmentId: string;
    client: string;
    car: string;
    selectedServices: string[];
    total: number;
    selectedDate: Date | undefined;
    selectedTime: string;
    assignedMechanic: string;
};

export type MaintenanceType = {
    notes: string
    mn_assigned: string
    mn_made: string
    mn_completed: string
}

export type FolioStatusProps = {statusSteps: {label:string,icon:JSX.Element}[], progressWidth: number, currentIndex:number}