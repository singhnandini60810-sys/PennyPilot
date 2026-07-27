import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  confirmPasswordReset,
  confirmSignup,
  getCurrentSession,
  requestPasswordReset,
  resendVerificationCode,
  signIn,
  signOut,
  signUp,
  type AuthenticatedUser,
  type SignupData,
} from "../services/authService";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: SignupData) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string,
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = await getCurrentSession();
      setUser(currentUser);
    } catch (sessionError) {
      setUser(null);
      setError(getErrorMessage(sessionError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const authenticatedUser = await signIn(email, password);
        setUser(authenticatedUser);
      } catch (loginError) {
        setUser(null);
        const message = getErrorMessage(loginError);
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const register = useCallback(async (data: SignupData) => {
    setIsLoading(true);
    setError(null);

    try {
      await signUp(data);
    } catch (signupError) {
      const message = getErrorMessage(signupError);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await confirmSignup(email, code);
      } catch (verificationError) {
        const message = getErrorMessage(verificationError);
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const resendCode = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await resendVerificationCode(email);
    } catch (resendError) {
      const message = getErrorMessage(resendError);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await requestPasswordReset(email);
    } catch (forgotPasswordError) {
      const message = getErrorMessage(forgotPasswordError);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (
      email: string,
      code: string,
      newPassword: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        await confirmPasswordReset(email, code, newPassword);
      } catch (resetError) {
        const message = getErrorMessage(resetError);
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    signOut();
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
      login,
      register,
      verifyEmail,
      resendCode,
      forgotPassword,
      resetPassword,
      logout,
      clearError,
    }),
    [
      user,
      isLoading,
      error,
      login,
      register,
      verifyEmail,
      resendCode,
      forgotPassword,
      resetPassword,
      logout,
      clearError,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}