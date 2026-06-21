import axios from 'axios';
import api from './api';
import { AuthUser } from '../contexts/AuthContext';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface VerifyCodeRequest {
  email: string;
  code: string;
}

interface ResetPasswordRequest {
  resetToken: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

interface ForgotPasswordResponse {
  message: string;
}

interface VerifyCodeResponse {
  resetToken: string;
}

interface ResetPasswordResponse {
  message: string;
}

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      if (Array.isArray(data.message)) {
        return data.message[0];
      }
      return data.message;
    }
    if (error.response?.status === 401) {
      return 'Credenciais inválidas';
    }
    if (error.response?.status === 409) {
      return 'E-mail já cadastrado';
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }
  }
  return 'Erro inesperado. Tente novamente.';
}

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    try {
      const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async verifyCode(data: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    try {
      const response = await api.post<VerifyCodeResponse>('/auth/verify-code', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async getProfile(): Promise<AuthUser> {
    try {
      const response = await api.get<AuthUser>('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};
