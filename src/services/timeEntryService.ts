import axios from 'axios';
import { API_CONFIG, getAuthHeaders, getApiUrl } from '../config/api.config';

export interface ClientWithMatters {
  id: number;
  shortName: string;
  businessName: string;
  taxId: string;
  phone: string;
  email: string;
  contact: string;
  website: string;
  additionalNotes: string;
  countryId: number;
  countryName: string;
  matters: Matter[];
}

export interface Matter {
  id: number;
  clientId: number;
  name?: string;
  openingDate?: string;
  phone?: string;
  email?: string;
  contact?: string;
  effectiveDate?: string;
  agreement?: string;
}

export interface TimeEntry {
  id: number;
  clientId?: number;
  matterId?: number;
  description?: string;
  timeEntryDate?: string;
  startTime?: string;
  endTime?: string;
  // Additional fields for display
  clientName?: string;
  matterName?: string;
  duration?: number;
}

export interface CreateTimeEntryDTO {
  clientId?: number;
  matterId?: number;
  description?: string;
  timeEntryDate?: Date;
  startTime?: Date;
  endTime?: Date;
}

const RESOURCE_PATH = API_CONFIG.RESOURCES.TIME_ENTRIES;
const CLIENTS_RESOURCE_PATH = API_CONFIG.RESOURCES.CLIENTS;

export const getAllClientsWithMatters = async (): Promise<ClientWithMatters[]> => {
  const response = await axios.get(getApiUrl(`/${CLIENTS_RESOURCE_PATH}/get-all-clients-detailed`), {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const getAllTimeEntries = async (): Promise<TimeEntry[]> => {
  const response = await axios.get(getApiUrl(`/${RESOURCE_PATH}/get-all-time-entries`), {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const registerTimeEntry = async (data: CreateTimeEntryDTO): Promise<TimeEntry> => {
  const response = await axios.post(getApiUrl(`/${RESOURCE_PATH}/register-time-entry`), data, {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const deleteTimeEntry = async (registryId: number): Promise<boolean> => {
  const response = await axios.delete(getApiUrl(`/${RESOURCE_PATH}/${registryId}`), {
    headers: getAuthHeaders()
  });
  return response.status == 200;
};

// Helper function to convert TimeEntry objects to SyncFusion Schedule events
export const convertTimeEntriesToEvents = (timeEntries: TimeEntry[]) => {
  return timeEntries.map(entry => {
    // Parse dates from string to Date objects
    var startingHours = entry.startTime ? new Date(entry.startTime) : new Date();
    var endingHours = entry.endTime ? new Date(entry.endTime) :  new Date();

    const startEventTime = entry.timeEntryDate? new Date(entry.timeEntryDate) : undefined;
    const endingEventTime = entry.timeEntryDate? new Date(entry.timeEntryDate) : undefined;

    startEventTime?.setHours(startingHours.getHours());
    startEventTime?.setMinutes(startingHours.getMinutes());

    endingEventTime?.setHours(endingHours.getHours());
    endingEventTime?.setMinutes(endingHours.getMinutes());


    return {
      Id: entry.id,
      Subject: entry.description || 'Time Entry',
      StartTime: startEventTime,
      EndTime: endingEventTime,
      IsAllDay: false,
      // Add custom fields for additional info
      ClientId: entry.clientId,
      ClientName: entry.clientName,
      MatterId: entry.matterId,
      MatterName: entry.matterName,
    };
  }).filter(event => event.StartTime && event.EndTime); // Filter out events with invalid dates
};