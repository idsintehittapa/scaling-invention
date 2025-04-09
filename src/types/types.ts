interface Incidents {
  id: string;
  incident_date: string;
  incident_type: string;
}

export interface IncidentsData {
  violent_crimes: Incidents[];
}

export interface CalendarValue {
  date: string;
  count: number;
  incidents: {
    id: string;
    incident_type: string;
  }[];
}
