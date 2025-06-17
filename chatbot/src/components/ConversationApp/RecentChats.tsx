import { useAuth } from "../../context/auth";
import { authenticateGate } from "../ChatInput";
import { fetchRecentChats } from "../../apiFunctions/databaseOperations/fetchRecentChats";

// Get the useroid to act on
// Fetch (offload?) metadata
// Use this array to load table
// Table should be click

const AuthUser = () => {
  const userInformation = useAuth();
  const authGate = authenticateGate(
    userInformation.login,
    userInformation.isAuthenticated,
    userInformation.user
  );
  if (authGate) {
    return authGate;
  }
};

const getUserInformation = () => {
  const userInformation = useAuth();
  if (userInformation.user?.oid) {
    return userInformation.user?.oid;
  } else {
    console.log("In Recent Chats cannot fetch user.oid");
    return null;
  }
};

const ShowTable = (listRecentChats: string[] | undefined) => {};

const RecentChats = async () => {
  const UserAuth = AuthUser();
  if (UserAuth) {
    return UserAuth;
  }
  const oid = getUserInformation();
  if (oid) {
    const listRecentChats = await fetchRecentChats(oid);
    const renderTable = ShowTable(listRecentChats);
    return renderTable;
  } else {
    console.log("No oid found");
    return;
  }
};
