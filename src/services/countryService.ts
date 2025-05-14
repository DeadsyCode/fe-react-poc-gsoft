import axios from 'axios';
import { API_CONFIG, getAuthHeaders, getApiUrl } from '../config/api.config';

export interface Country {
  id: number;
  descriptionES: string;
  descriptionEN: string;
  code: string;
  isoCode: string;
  isoCode2: string;
  isoCode3: string;
}

const RESOURCE_PATH = API_CONFIG.RESOURCES.COUNTRIES;

export const getAllCountries = async (): Promise<Country[]> => {
  const response = await axios.get(getApiUrl(`/${RESOURCE_PATH}/get-all-countries`), {
    headers: getAuthHeaders()
  });

  return response.data;
};