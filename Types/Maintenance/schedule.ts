export type CalendarMaintenance = {
    selected: Date | undefined,
    onSelect: React.Dispatch<React.SetStateAction<Date | undefined>>,
    fromDate?: Date,
    toDate?: Date
};

export type ScheduleClientSelection = {
    setClient: React.Dispatch<React.SetStateAction<string>>;
    client: string;
    setCar: React.Dispatch<React.SetStateAction<string>>;
    car: string;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    clients: clients[]
};

export type ScheduleListType = {
    setValue: React.Dispatch<React.SetStateAction<string>>;
    value: string;
    values: clients[] | string[]
};

export type clients = {
    client_id: number
    first_name: string
}

export type ScheduleServicesType = {
    setStep: React.Dispatch<React.SetStateAction<number>>;
    setMechanic: React.Dispatch<React.SetStateAction<string>>;
    mechanic: string;
    mechanics: any[]
    total: number
    selectedServices: string[]
    setSelectedServices: React.Dispatch<React.SetStateAction<string[]>>
};

export type MechanicsScheduleType = {
    setMechanic: React.Dispatch<React.SetStateAction<string>>;
    mechanic: string;
    mechanics: any[]
}

export type ServicesScheduleType = {
    setSelectedServices: React.Dispatch<React.SetStateAction<string[]>>;
    selectedServices: string[]
    services: services[]
};

type services = {
    name: string,
    service_price: number
}

export type ScheduleServicesSelectedType = {
    services: services[]
    selectedServices: string[]
    total: number
}

export type ScheduleAppointmentType = {
    selectedDate: Date | undefined
    setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>
    setSelectedTime: React.Dispatch<React.SetStateAction<string>>;
    selectedTime: string;
    setStep: React.Dispatch<React.SetStateAction<number>>
}

export type ScheduleAvailableTimesType = {
    setSelectedTime: React.Dispatch<React.SetStateAction<string>>;
    selectedTime: string;
};

export type ScheduleResultsType = {
    appointmentId: string;
    client: string;
    car: string
    selectedServices: string[]
    total: number
    selectedDate: Date | undefined
    selectedTime: string
    assignedMechanic: string
};