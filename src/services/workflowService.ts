import axios from 'axios';
import { API_CONFIG, getAuthHeaders, getApiUrl } from '../config/api.config';

interface ProcessType {
  id: number;
  description: string;
  averageDuration: number | null;
  state: boolean;
}

interface ProcessPhase {
  id: number;
  processTypeId: number;
  description: string;
  order: number;
  duration: number | null;
  state: boolean;
  processTypeDescription: string;
}

interface CreateProcessTypeDTO {
  description: string;
  averageDuration?: number | null;
  state?: boolean;
}

interface UpdateProcessTypeRequest {
  id: number;
  description: string;
  averageDuration: number | null;
  state: boolean;
}

const RESOURCE_PATH_TYPES = API_CONFIG.RESOURCES.WORKFLOWS_PROCESS_TYPES;
const RESOURCE_PATH_PHASES = API_CONFIG.RESOURCES.WORKFLOWS_PROCESS_PHASES;

export const getAllProcessTypes = async (): Promise<ProcessType[]> => {
  const response = await axios.get(getApiUrl(`/${RESOURCE_PATH_TYPES}/get-all`), {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const createProcessType = async (data: CreateProcessTypeDTO): Promise<ProcessType> => {
  const response = await axios.post(getApiUrl(`/${RESOURCE_PATH_TYPES}/create-process-type`), data, {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const updateProcessType = async (id: number, data: ProcessType): Promise<ProcessType> => {
  const response = await axios.put(getApiUrl(`/${RESOURCE_PATH_TYPES}/${id}`), data, {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const deleteProcessType = async (id: number): Promise<void> => {
  await axios.delete(getApiUrl(`/${RESOURCE_PATH_TYPES}/${id}`), {
    headers: getAuthHeaders()
  });
};

// New service for process phases
export const getProcessPhasesByProcessTypeId = async (processTypeId: number): Promise<ProcessPhase[]> => {
  if (!processTypeId) {
    return [];
  }

  const response = await axios.get(getApiUrl(`/${RESOURCE_PATH_PHASES}/by-process-type/${processTypeId}`), {
    headers: getAuthHeaders()
  });

  return response.data;
};