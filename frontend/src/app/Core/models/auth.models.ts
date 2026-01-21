
export enum StudyMajor {
  GL = 'GL',
  RT = 'RT',
  IMI = 'IMI',
  IIA = 'IIA',
  BIO = 'BIO',
  CH = 'CH',
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  lastName: string;
  major: StudyMajor;
  dateOfBirth: string;
  image?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  requiresOtp?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  major: StudyMajor;
  dateOfBirth: string;
  image?: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
}

export interface OtpResponse {
  message: string;
  requiresOtp: boolean;
  email?: string;
}

export interface VerifyEmailResponse {
  message: string;
  success: boolean;
}