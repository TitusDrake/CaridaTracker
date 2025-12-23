import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API base URL - update this for production
// For Android emulator: use 10.0.2.2 (alias for host machine's localhost)
// Requires port forwarding from Windows to WSL if backend runs in WSL:
//   netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$(wsl hostname -I)
const API_BASE_URL = __DEV__
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api')
  : 'https://your-production-api.com/api';

// Storage keys
export const TOKEN_KEY = '@CaridaTracker:token';
export const USER_KEY = '@CaridaTracker:user';

// Types
export interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  tkid?: string;
  organizationId?: number;
  clubId?: number;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  tkid?: string;
  organizationId?: string;
  clubId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error?: string;
  errors?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
}

export interface Organization {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Club {
  id: number;
  organization_id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to get stored token
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Helper to store token and user
export const storeAuthData = async (token: string, user: User): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(user)],
    ]);
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw error;
  }
};

// Helper to clear auth data
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

// Helper to get stored user
export const getStoredUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

// Generic fetch wrapper for public endpoints (no auth required)
const fetchPublic = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('fetchPublic - URL:', url);
  console.log('fetchPublic - API_BASE_URL:', API_BASE_URL);
  console.log('fetchPublic - endpoint:', endpoint);

  // Add timeout using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('fetchPublic - Request timed out after 10 seconds');
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    console.log('fetchPublic - Response received:', response.status);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('fetchPublic - Request aborted (timeout)');
      throw new Error('Request timed out. Is the backend server running and accessible?');
    }
    console.error('fetchPublic - Fetch error:', error);
    throw error;
  }
};

// Generic fetch wrapper with auth
const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

// Auth API calls
export const authApi = {
  // Register a new user
  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    // Convert empty strings to undefined for optional fields
    const payload: any = {
      email: registerData.email,
      username: registerData.username,
      password: registerData.password,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      phoneNumber: registerData.phoneNumber || undefined,
      tkid: registerData.tkid || undefined,
    };

    // Convert organizationId and clubId to numbers if provided
    if (registerData.organizationId) {
      const orgId = parseInt(registerData.organizationId, 10);
      if (!isNaN(orgId)) {
        payload.organizationId = orgId;
      }
    }
    if (registerData.clubId) {
      const clubIdNum = parseInt(registerData.clubId, 10);
      if (!isNaN(clubIdNum)) {
        payload.clubId = clubIdNum;
      }
    }

    const response = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data as AuthResponse;
  },

  // Login user
  login: async (emailOrUsername: string, password: string): Promise<AuthResponse> => {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data as AuthResponse;
  },

  // Get current user
  me: async (): Promise<User> => {
    const response = await fetchWithAuth('/auth/me', {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data as User;
  },

  // Forgot password (placeholder - needs backend endpoint)
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    // TODO: Implement when backend endpoint is available
    console.log('Forgot password requested for:', email);
    return { message: 'If an account exists with this email, you will receive password reset instructions.' };
  },
};

// Organizations API calls
export const organizationApi = {
  // Get all organizations (public endpoint - no auth required)
  getAll: async (): Promise<Organization[]> => {
    try {
      const url = `${API_BASE_URL}/organizations`;
      console.log('Fetching organizations from:', url);
      
      const response = await fetchPublic('/organizations', {
        method: 'GET',
      });

      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch organizations' }));
        console.error('Error response:', errorData);
        throw errorData as ApiError;
      }

      const data = await response.json();
      console.log('Organizations data received:', data);
      return data as Organization[];
    } catch (error) {
      console.error('Error in organizationApi.getAll:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        console.error('Network error - check if backend is running and accessible');
        console.error('API_BASE_URL:', API_BASE_URL);
      }
      throw error;
    }
  },

  // Get organization by ID (public endpoint)
  getById: async (id: number): Promise<Organization> => {
    const response = await fetchPublic(`/organizations/${id}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data as Organization;
  },
};

// Clubs API calls
export const clubApi = {
  // Get all clubs (public endpoint - no auth required)
  getAll: async (): Promise<Club[]> => {
    const response = await fetchPublic('/clubs', {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data as Club[];
  },

  // Get clubs by organization (public endpoint - no auth required)
  getByOrganization: async (organizationId: number): Promise<Club[]> => {
    try {
      const response = await fetchPublic(`/clubs/organization/${organizationId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch clubs' }));
        throw errorData as ApiError;
      }

      const data = await response.json();
      return data as Club[];
    } catch (error) {
      console.error('Error in clubApi.getByOrganization:', error);
      throw error;
    }
  },

  // Get club by ID (public endpoint)
  getById: async (id: number): Promise<Club> => {
    const response = await fetchPublic(`/clubs/${id}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data as Club;
  },
};

export default authApi;
