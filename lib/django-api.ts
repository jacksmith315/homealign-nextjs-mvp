import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';
const DJANGO_API_BASE_URL = process.env.DJANGO_API_BASE_URL || 'http://localhost:8000/core-api';

// Create axios instance for Django API calls
export const djangoApi = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to make authenticated requests to Django
export async function makeDjangoRequest(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    baseURL?: string;
  } = {}
): Promise<AxiosResponse> {
  const {
    method = 'GET',
    data,
    headers = {},
    params,
    baseURL = DJANGO_API_BASE_URL
  } = options;

  const config: AxiosRequestConfig = {
    method,
    url: `${baseURL}${endpoint}`,
    headers,
    params,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.data = data;
  }

  return djangoApi(config);
}

// Helper function for authentication requests
export async function makeAuthRequest(
  endpoint: string,
  data?: any,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'
): Promise<AxiosResponse> {
  return makeDjangoRequest(endpoint, {
    method,
    data,
    baseURL: DJANGO_API_URL,
  });
}