import axios from 'axios';
import { Client } from './clientService';
import { API_CONFIG, getAuthHeaders, getApiUrl } from '../config/api.config';

export interface Matter {
  id: number;
  clientId?: number;
  name?: string;
  openingDate?: Date;
  phone?: string;
  email?: string;
  contact?: string;
  effectiveDate?: Date;
  agreement?: string;
  clientName?: string; // For display purposes when listing matters
}

export interface CreateMatterDTO {
  clientId?: number;
  name?: string;
  openingDate?: Date;
  phone?: string;
  email?: string;
  contact?: string;
  effectiveDate?: Date;
  agreement?: string;
}

const RESOURCE_PATH = API_CONFIG.RESOURCES.MATTERS;

export const getAllMatters = async (): Promise<Matter[]> => {
  const response = await axios.get(getApiUrl(`/${RESOURCE_PATH}/get-all-matters`), {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const getMatterById = async (id: number): Promise<Matter> => {
  const response = await axios.get(getApiUrl(`/${RESOURCE_PATH}/${id}`), {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const getMattersByClient = async (clientId: number): Promise<Matter[]> => {
  const response = await axios.get(getApiUrl(`/${RESOURCE_PATH}/client/${clientId}`), {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const createMatter = async (data: CreateMatterDTO): Promise<Matter> => {
  const response = await axios.post(getApiUrl(`/${RESOURCE_PATH}/create-matter`), data, {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const updateMatter = async (id: number, data: CreateMatterDTO): Promise<Matter> => {
  const response = await axios.put(getApiUrl(`/${RESOURCE_PATH}/${id}`), data, {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const deleteMatter = async (id: number): Promise<void> => {
  await axios.delete(getApiUrl(`/${RESOURCE_PATH}/${id}`), {
    headers: getAuthHeaders()
  });
};