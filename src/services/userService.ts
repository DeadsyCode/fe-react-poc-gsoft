import axios from 'axios';
import { API_CONFIG, getAuthHeaders, getApiUrl } from '../config/api.config';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  roleName: string;
  state: string | null;
  type: string | null;
  chiefId: number | null;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleId: number;
  type?: string;
  chiefId?: number | null;
}

export interface UpdateUserDTO {
  email: string;
  firstName?: string;
  lastName?: string;
  roleId: number;
  type?: string;
  chiefId?: number | null;
}

const RESOURCE_PATH = API_CONFIG.RESOURCES.USERS;

export const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get(getApiUrl(`/${RESOURCE_PATH}/get-all-users`), {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await axios.get(getApiUrl(`/${RESOURCE_PATH}/${id}`), {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const createUser = async (data: CreateUserDTO): Promise<User> => {
  const response = await axios.post(getApiUrl(`/${RESOURCE_PATH}/create-user`), data, {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const updateUser = async (id: number, data: UpdateUserDTO): Promise<User> => {
  const response = await axios.put(getApiUrl(`/${RESOURCE_PATH}/${id}`), data, {
    headers: getAuthHeaders()
  });

  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(getApiUrl(`/${RESOURCE_PATH}/${id}`), {
    headers: getAuthHeaders()
  });
};