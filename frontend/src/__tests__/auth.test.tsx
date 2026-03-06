import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { personalAuthService } from '@/lib/api';
import { 
  generateFakeUserData, 
  generateMockLoginResponse, 
  generateMockErrorResponse,
  generateMockChangePasswordResponse,
  generateTestPassword,
  mockFetch,
  clearAllMocks,
  setupLocalStorageMock
} from './utils/testHelpers';

// Mock the API service
jest.mock('@/lib/api', () => ({
  personalAuthService: {
    login: jest.fn(),
    changePassword: jest.fn(),
  },
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isAuthenticated, login, logout, requiresPasswordChange } = useAuth();
  
  return (
    <div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user-name">{user?.name || 'No user'}</div>
      <div data-testid="requires-password-change">{requiresPasswordChange.toString()}</div>
      <button onClick={() => login('TEST123', 'password', true)}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('Authentication Flow Tests', () => {
  let localStorageMock: any;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    clearAllMocks();
    localStorageMock = setupLocalStorageMock();
    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Create New User (Frontend Integration)', () => {
    test('should handle user creation flow', async () => {
      const mockUser = generateFakeUserData();
      const mockResponse = generateMockLoginResponse(mockUser, true);
      
      (personalAuthService.login as jest.Mock).mockResolvedValueOnce(mockResponse.data);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No user');

      // Simulate login (which would happen after user creation)
      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-name')).toHaveTextContent(mockUser.name);
        expect(screen.getByTestId('requires-password-change')).toHaveTextContent('true');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockResponse.data.token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user));
    });
  });

  describe('2. Login with Default Password', () => {
    test('should login successfully with default password', async () => {
      const mockUser = generateFakeUserData();
      const mockResponse = generateMockLoginResponse(mockUser, true);
      
      (personalAuthService.login as jest.Mock).mockResolvedValueOnce(mockResponse.data);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('requires-password-change')).toHaveTextContent('true');
      });

      expect(personalAuthService.login).toHaveBeenCalledWith({
        army_no: 'TEST123',
        password: 'password'
      });
    });

    test('should handle login failure', async () => {
      const mockError = generateMockErrorResponse('Invalid army number or password');
      
      (personalAuthService.login as jest.Mock).mockRejectedValueOnce(new Error(mockError.message));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
      });

      expect(personalAuthService.login).toHaveBeenCalledWith({
        army_no: 'TEST123',
        password: 'password'
      });
    });
  });

  describe('3. Change Password', () => {
    test('should change password successfully', async () => {
      const mockUser = generateFakeUserData();
      const mockLoginResponse = generateMockLoginResponse(mockUser, true);
      const mockChangePasswordResponse = generateMockChangePasswordResponse();
      
      (personalAuthService.login as jest.Mock).mockResolvedValueOnce(mockLoginResponse.data);
      (personalAuthService.changePassword as jest.Mock).mockResolvedValueOnce(mockChangePasswordResponse);

      // Mock the change password component
      const ChangePasswordComponent = () => {
        const { user } = useAuth();
        const [currentPassword, setCurrentPassword] = React.useState('');
        const [newPassword, setNewPassword] = React.useState('');
        const [message, setMessage] = React.useState('');

        const handleChangePassword = async () => {
          try {
            await personalAuthService.changePassword({
              current_password: currentPassword,
              new_password: newPassword
            });
            setMessage('Password changed successfully');
          } catch (error) {
            setMessage('Password change failed');
          }
        };

        return (
          <div>
            <input 
              data-testid="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
            />
            <input 
              data-testid="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
            />
            <button data-testid="change-password-btn" onClick={handleChangePassword}>
              Change Password
            </button>
            <div data-testid="message">{message}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
          <ChangePasswordComponent />
        </AuthProvider>
      );

      // First login
      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      // Change password
      await user.type(screen.getByTestId('current-password'), 'oldpassword');
      await user.type(screen.getByTestId('new-password'), 'newpassword123');
      fireEvent.click(screen.getByTestId('change-password-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('message')).toHaveTextContent('Password changed successfully');
      });

      expect(personalAuthService.changePassword).toHaveBeenCalledWith({
        current_password: 'oldpassword',
        new_password: 'newpassword123'
      });
    });
  });

  describe('4. Login with New Password', () => {
    test('should login successfully with new password', async () => {
      const mockUser = generateFakeUserData();
      const mockResponse = generateMockLoginResponse(mockUser, false); // Not default password
      
      (personalAuthService.login as jest.Mock).mockResolvedValueOnce(mockResponse.data);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('requires-password-change')).toHaveTextContent('false');
      });

      expect(personalAuthService.login).toHaveBeenCalledWith({
        army_no: 'TEST123',
        password: 'password'
      });
    });
  });

  describe('Complete Authentication Flow Integration Test', () => {
    test('should complete full authentication flow', async () => {
      const mockUser = generateFakeUserData();
      const defaultPasswordResponse = generateMockLoginResponse(mockUser, true);
      const newPasswordResponse = generateMockLoginResponse(mockUser, false);
      const changePasswordResponse = generateMockChangePasswordResponse();
      
      // Mock the sequence of API calls
      (personalAuthService.login as jest.Mock)
        .mockResolvedValueOnce(defaultPasswordResponse.data) // First login with default
        .mockResolvedValueOnce(newPasswordResponse.data); // Second login with new password
      
      (personalAuthService.changePassword as jest.Mock)
        .mockResolvedValueOnce(changePasswordResponse);

      const FullFlowComponent = () => {
        const { user, isAuthenticated, login, logout, requiresPasswordChange } = useAuth();
        const [step, setStep] = React.useState(1);
        const [message, setMessage] = React.useState('');

        const handleStep1 = async () => {
          try {
            await login('TEST123', 'TEST123', true); // Default password
            setStep(2);
            setMessage('Step 1: Login with default password successful');
          } catch (error) {
            setMessage('Step 1 failed');
          }
        };

        const handleStep2 = async () => {
          try {
            await personalAuthService.changePassword({
              current_password: 'TEST123',
              new_password: 'newpassword123'
            });
            setStep(3);
            setMessage('Step 2: Password changed successfully');
          } catch (error) {
            setMessage('Step 2 failed');
          }
        };

        const handleStep3 = async () => {
          try {
            await login('TEST123', 'newpassword123', true); // New password
            setStep(4);
            setMessage('Step 3: Login with new password successful');
          } catch (error) {
            setMessage('Step 3 failed');
          }
        };

        return (
          <div>
            <div data-testid="step">{step}</div>
            <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
            <div data-testid="requires-password-change">{requiresPasswordChange.toString()}</div>
            <div data-testid="message">{message}</div>
            
            {step === 1 && <button onClick={handleStep1}>Step 1: Login with Default</button>}
            {step === 2 && <button onClick={handleStep2}>Step 2: Change Password</button>}
            {step === 3 && <button onClick={handleStep3}>Step 3: Login with New Password</button>}
            {step === 4 && <div data-testid="flow-complete">Flow Complete!</div>}
            
            <button onClick={logout}>Logout</button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <FullFlowComponent />
        </AuthProvider>
      );

      // Step 1: Login with default password
      expect(screen.getByTestId('step')).toHaveTextContent('1');
      fireEvent.click(screen.getByText('Step 1: Login with Default'));

      await waitFor(() => {
        expect(screen.getByTestId('step')).toHaveTextContent('2');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('requires-password-change')).toHaveTextContent('true');
        expect(screen.getByTestId('message')).toHaveTextContent('Step 1: Login with default password successful');
      });

      // Step 2: Change password
      fireEvent.click(screen.getByText('Step 2: Change Password'));

      await waitFor(() => {
        expect(screen.getByTestId('step')).toHaveTextContent('3');
        expect(screen.getByTestId('message')).toHaveTextContent('Step 2: Password changed successfully');
      });

      // Step 3: Login with new password
      fireEvent.click(screen.getByText('Step 3: Login with New Password'));

      await waitFor(() => {
        expect(screen.getByTestId('step')).toHaveTextContent('4');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('requires-password-change')).toHaveTextContent('false');
        expect(screen.getByTestId('message')).toHaveTextContent('Step 3: Login with new password successful');
        expect(screen.getByTestId('flow-complete')).toBeInTheDocument();
      });

      // Verify all API calls were made
      expect(personalAuthService.login).toHaveBeenCalledTimes(2);
      expect(personalAuthService.changePassword).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle network errors gracefully', async () => {
      (personalAuthService.login as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
      });
    });

    test('should handle logout correctly', async () => {
      const mockUser = generateFakeUserData();
      const mockResponse = generateMockLoginResponse(mockUser, false);
      
      (personalAuthService.login as jest.Mock).mockResolvedValueOnce(mockResponse.data);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login first
      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      // Then logout
      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });
});
