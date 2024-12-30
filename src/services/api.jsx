import axios from 'axios';

// Definimos la URL base
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-api-produccion.com'  // URL de producción
  : 'http://localhost:8000';         // URL de desarrollo

console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', API_URL);

// Si no hay URL de API, muestra un error más descriptivo
if (!API_URL) {
  console.error('VITE_API_URL no está definida en las variables de entorno');
}

// Instancia específica para login sin interceptor
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Instancia principal con interceptor para el resto de endpoints
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (credentials) => {
    try {
      const response = await authApi.post('/api/login', credentials);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
};

export const ratesService = {
  getRates: async () => {
    try {
      const response = await api.get('/api/tasas');
      return response.data;
    } catch (error) {
      console.error('Error fetching rates:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      throw error;
    }
  },

  createRate: async (payload) => {
    try {
      const response = await api.post('/api/tasas/create', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating rate:', error);
      throw error;
    }
  },

  updateRate: async (idOp, payload) => {
    try {
      const response = await api.post(`/api/tasas/${idOp}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating rate:', error);
      throw error;
    }
  },

  deleteRate: async (idOp) => {
    try {
      const response = await api.delete(`/api/tasas/${idOp}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting rate:', error);
      throw error;
    }
  }
};