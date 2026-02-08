import { authApi, organizationApi, clubApi } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('authApi', () => {
    it('should have register method', () => {
      expect(authApi.register).toBeDefined();
      expect(typeof authApi.register).toBe('function');
    });

    it('should have login method', () => {
      expect(authApi.login).toBeDefined();
      expect(typeof authApi.login).toBe('function');
    });

    it('should have me method', () => {
      expect(authApi.me).toBeDefined();
      expect(typeof authApi.me).toBe('function');
    });
  });

  describe('organizationApi', () => {
    it('should have getAll method', () => {
      expect(organizationApi.getAll).toBeDefined();
      expect(typeof organizationApi.getAll).toBe('function');
    });
  });

  describe('clubApi', () => {
    it('should have getAll method', () => {
      expect(clubApi.getAll).toBeDefined();
      expect(typeof clubApi.getAll).toBe('function');
    });

    it('should have getByOrganization method', () => {
      expect(clubApi.getByOrganization).toBeDefined();
      expect(typeof clubApi.getByOrganization).toBe('function');
    });
  });
});



