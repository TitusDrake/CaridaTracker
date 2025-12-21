import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - update this for production
const API_BASE_URL = 'http://localhost:3000/api';

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

// Generic fetch wrapper with auth
const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
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
  // Get all organizations
  getAll: async (): Promise<Organization[]> => {
    const response = await fetchWithAuth('/organizations', {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data as Organization[];
  },

  // Get organization by ID
  getById: async (id: number): Promise<Organization> => {
    const response = await fetchWithAuth(`/organizations/${id}`, {
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
  // Get all clubs
  getAll: async (): Promise<Club[]> => {
    const response = await fetchWithAuth('/clubs', {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data as Club[];
  },

  // Get clubs by organization
  getByOrganization: async (organizationId: number): Promise<Club[]> => {
    const response = await fetchWithAuth(`/clubs/organization/${organizationId}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data as Club[];
  },

  // Get club by ID
  getById: async (id: number): Promise<Club> => {
    const response = await fetchWithAuth(`/clubs/${id}`, {
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
