import axios from 'axios';
import { API_CONFIG, getAuthHeaders, getApiUrl } from '../config/api.config';

export interface Client {
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
}

export interface CreateClientDTO {
  shortName: string;
  businessName: string;
  taxId: string;
  phone: string;
  email: string;
  contact: string;
  website: string;
  additionalNotes: string;
  countryId: number;
}

const RESOURCE_PATH = API_CONFIG.RESOURCES.CLIENTS;

export const getAllClients = async (): Promise<Client[]> => {
  const response = await axios.get(getApiUrl(`/${RESOURCE_PATH}/get-all-clients`), {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const getClientById = async (id: number): Promise<Client> => {
  const response = await axios.get(getApiUrl(`/${RESOURCE_PATH}/get-client-by-id/${id}`), {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const getClientsByCountry = async (countryId: number): Promise<Client[]> => {
  const response = await axios.get(getApiUrl(`/${RESOURCE_PATH}/get-clients-by-country/${countryId}`), {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const createClient = async (data: CreateClientDTO): Promise<Client> => {
  const response = await axios.post(getApiUrl(`/${RESOURCE_PATH}/create-client`), data, {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const updateClient = async (id: number, data: CreateClientDTO): Promise<Client> => {
  const response = await axios.put(getApiUrl(`/${RESOURCE_PATH}/update-client/${id}`), data, {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const deleteClient = async (id: number): Promise<void> => {
  await axios.delete(getApiUrl(`/${RESOURCE_PATH}/delete-client/${id}`), {
    headers: getAuthHeaders()
  });
};