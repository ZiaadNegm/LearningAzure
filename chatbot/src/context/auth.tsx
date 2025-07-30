import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

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

const checkIsUserInDB = async (oid: string) => {
  console.log(`[DEBUG] Checking if user exists in DB with OID: ${oid}`);
  const userMetaDataUrl = `/api/userMetaData/exists/${encodeURIComponent(oid)}`;
  console.log(`[DEBUG] Request URL: ${userMetaDataUrl}`);

  const responseMetaData = await fetch(userMetaDataUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  console.log(`[DEBUG] Response status: ${responseMetaData.status}`);

  if (responseMetaData.ok) {
    return true;
  } else {
    return false;
  }
};

const putUserInDB = async (oid: string) => {
  const userMetaDataUrl = `/api/userMetaData/exists/${encodeURIComponent(oid)}`;
  console.log("POST request to put OID into databse has been made");
  const putRequest = fetch(userMetaDataUrl, {
    method: "POST",
    body: JSON.stringify({ oid: `${oid}` }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  try {
    const putRequestSend = await putRequest;
    if (!putRequestSend.ok) {
      throw new Error(`Can't put user into db with oid ${oid}`);
    }
  } catch (error) {
    console.error("Error when putting in a new user in the DB:", error);
    throw new Error("Cannot insert user into the DB");
  }
};

const OIDinDatabase = async (oid: string) => {
  const isUserInDB: boolean = await checkIsUserInDB(oid);
  if (!isUserInDB) {
    try {
      console.log("User HAS NOT BEEN FOUND IN THE DATABASE");
      await putUserInDB(oid);
    } catch (error) {
      throw new Error(
        `Having issues inserting user into the DB with the oid ${oid}`
      );
    }
  } else {
    console.log("USER HAS BEEN FOUND IN THE DATBASE WITH OID", oid);
  }
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
            OIDinDatabase(oid);
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
    window.location.href = "/login";
  };

  const logout = () => {
    window.location.href = "/logout";
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
