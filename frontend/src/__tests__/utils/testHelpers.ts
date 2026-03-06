import { faker } from '@faker-js/faker';

export interface MockUser {
  id: number;
  army_no: string;
  name: string;
  rank: string;
  role: string;
  isDefaultPassword?: boolean;
  requiresPasswordChange?: boolean;
}

export interface MockLoginResponse {
  status: 'success' | 'error';
  status_code: number;
  message: string;
  data: {
    token: string;
    user: MockUser;
    personnel: {
      id: number;
      army_no: string;
      name: string;
      rank: string;
      dob: string | null;
      doe: string | null;
      service: string;
      honors_awards: string | null;
      med_cat: string;
      special_skill: string | null;
      games_level: string | null;
      present_employment: string | null;
      planned_employment: string | null;
      photo_url: string | null;
    };
  } | null;
}

export interface MockChangePasswordResponse {
  status: 'success' | 'error';
  status_code: number;
  message: string;
  data: any;
}

/**
 * Generate fake user data for testing
 */
export const generateFakeUserData = (): MockUser => {
  const armyNo = `TEST${faker.string.alphanumeric(6).toUpperCase()}`;
  
  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    army_no: armyNo,
    name: faker.person.fullName(),
    rank: faker.helpers.arrayElement(['Soldier', 'Corporal', 'Sergeant', 'Lieutenant', 'Captain']),
    role: 'personal',
    isDefaultPassword: false,
    requiresPasswordChange: false
  };
};

/**
 * Generate a mock successful login response
 */
export const generateMockLoginResponse = (
  user: MockUser,
  isDefaultPassword: boolean = false
): MockLoginResponse => {
  return {
    status: 'success',
    status_code: 200,
    message: 'Login successful',
    data: {
      token: faker.string.alphanumeric(64),
      user: {
        ...user,
        isDefaultPassword,
        requiresPasswordChange: isDefaultPassword
      },
      personnel: {
        id: user.id,
        army_no: user.army_no,
        name: user.name,
        rank: user.rank,
        dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString(),
        doe: faker.date.past({ years: 10 }).toISOString(),
        service: 'Army',
        honors_awards: faker.lorem.sentence(),
        med_cat: faker.helpers.arrayElement(['A', 'B', 'C']),
        special_skill: faker.lorem.words(3),
        games_level: faker.helpers.arrayElement(['National', 'State', 'District', 'Unit']),
        present_employment: faker.lorem.words(5),
        planned_employment: faker.lorem.words(5),
        photo_url: faker.image.avatar()
      }
    }
  };
};

/**
 * Generate a mock error response
 */
export const generateMockErrorResponse = (message: string, statusCode: number = 401) => {
  return {
    status: 'error' as const,
    status_code: statusCode,
    message,
    data: null
  };
};

/**
 * Generate a mock successful password change response
 */
export const generateMockChangePasswordResponse = (): MockChangePasswordResponse => {
  return {
    status: 'success',
    status_code: 200,
    message: 'Password changed successfully',
    data: {}
  };
};

/**
 * Generate a strong password for testing
 */
export const generateTestPassword = (): string => {
  return faker.internet.password({ 
    length: 12, 
    memorable: false, 
    pattern: /[A-Za-z0-9!@#$%^&*]/
  });
};

/**
 * Mock fetch for API calls
 */
export const mockFetch = (response: any, shouldReject: boolean = false) => {
  const mockResponse = {
    ok: response.status_code < 400,
    status: response.status_code,
    json: async () => response,
  };

  if (shouldReject) {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
  } else {
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
  }
};

/**
 * Clear all mocks
 */
export const clearAllMocks = () => {
  jest.clearAllMocks();
  localStorage.clear();
};

/**
 * Setup localStorage mock
 */
export const setupLocalStorageMock = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  
  return localStorageMock;
};
