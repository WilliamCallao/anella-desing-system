export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt?: number;
}

export interface AuthProvider {
  signIn(email: string, password: string): Promise<Session>;
  signOut(): Promise<void>;
  getSession(): Promise<Session | null>;
  onSessionChange(callback: (session: Session | null) => void): () => void;
}
