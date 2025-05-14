import axios from 'axios';
import { API_CONFIG, getAuthHeaders, getApiUrl } from '../config/api.config';

// Generic CRUD service
export class ApiService<T, CreateDTO> {
  private resourcePath: string;
  private getAllEndpoint: string;
  private getByIdEndpoint: string;
  private createEndpoint: string;
  private updateEndpoint: string;
  private deleteEndpoint: string;

  constructor(
    resourcePath: string, 
    {
      getAllEndpoint = 'get-all-{resource}',
      getByIdEndpoint = '{id}',
      createEndpoint = 'create-{resource}',
      updateEndpoint = '{id}',
      deleteEndpoint = '{id}'
    } = {}
  ) {
    this.resourcePath = resourcePath;
    
    // Replace {resource} placeholder with the actual resource name
    this.getAllEndpoint = getAllEndpoint.replace('{resource}', resourcePath);
    this.getByIdEndpoint = getByIdEndpoint;
    this.createEndpoint = createEndpoint.replace('{resource}', resourcePath);
    this.updateEndpoint = updateEndpoint;
    this.deleteEndpoint = deleteEndpoint;
  }

  async getAll(): Promise<T[]> {
    const response = await axios.get(getApiUrl(`/${this.resourcePath}/${this.getAllEndpoint}`), {
      headers: getAuthHeaders()
    });
    return response.data;
  }

  async getById(id: number): Promise<T> {
    const endpoint = this.getByIdEndpoint.replace('{id}', id.toString());
    const response = await axios.get(getApiUrl(`/${this.resourcePath}/${endpoint}`), {
      headers: getAuthHeaders()
    });
    return response.data;
  }

  async create(data: CreateDTO): Promise<T> {
    const response = await axios.post(getApiUrl(`/${this.resourcePath}/${this.createEndpoint}`), data, {
      headers: getAuthHeaders()
    });
    return response.data;
  }

  async update(id: number, data: CreateDTO): Promise<T> {
    const endpoint = this.updateEndpoint.replace('{id}', id.toString());
    const response = await axios.put(getApiUrl(`/${this.resourcePath}/${endpoint}`), data, {
      headers: getAuthHeaders()
    });
    return response.data;
  }

  async delete(id: number): Promise<void> {
    const endpoint = this.deleteEndpoint.replace('{id}', id.toString());
    await axios.delete(getApiUrl(`/${this.resourcePath}/${endpoint}`), {
      headers: getAuthHeaders()
    });
  }
}