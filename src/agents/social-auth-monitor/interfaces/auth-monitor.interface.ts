export interface AccountStatusResult {
  accountId: string;
  platform?: string;
  success: boolean;
  result?: any;
  error?: string;
}

export interface TokenStatus {
  valid: boolean;
  expiresIn: number;
}

export interface ConnectedAccount {
  id: string;
  platform: string;
  email: string;
  name: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string[];
  accountType: 'social' | 'email' | 'calendar' | 'productivity';
  metadata?: any;
}
