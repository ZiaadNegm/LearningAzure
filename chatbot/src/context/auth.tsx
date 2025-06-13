import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface userMetaData {
  oid: string;
  userDetails?: string;
  identityProvider?: string;
}

interface authenticateProperties {
  user: userMetaData | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const authContext = createContext<authenticateProperties | undefined>(
  undefined
);

const parseAndRetrieveOID = (userMetaDataResponse: any): string => {
  // Extract OID from Azure AD token
  return (
    userMetaDataResponse.clientPrincipal?.userId ||
    userMetaDataResponse.clientPrincipal?.userDetails ||
    ""
  );
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<userMetaData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/.auth/me");

      if (response.ok) {
        const data = await response.json();

        if (data.clientPrincipal) {
          const oid = parseAndRetrieveOID(data);

          if (oid) {
            setUser({
              oid,
              userDetails: data.clientPrincipal.userDetails,
              identityProvider: data.clientPrincipal.identityProvider,
            });
          } else {
            setUser(null);
            console.warn("No OID found in clientPrincipal");
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
        console.warn("Auth check failed:", response.status);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async (): Promise<void> => {
    setLoading(true);
    await checkAuthStatus();
  };

  const login = () => {
    window.location.href = "/login"
  };

  const logout = () => {
  window.location.href = "/logout"
  };

  // Check auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: authenticateProperties = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    refreshAuth,
  };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
