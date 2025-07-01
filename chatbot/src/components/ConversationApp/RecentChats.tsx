import { useAuth } from "../../context/auth";
import { authenticateGate } from "../ChatInput";
import { fetchRecentChats } from "../../apiFunctions/databaseOperations/fetchRecentChats";
import { useEffect, useState } from "react";

// Get the useroid to act on
// Fetch (offload?) metadata
// Use this array to load table
// Table should be click
const ShowTable = (listRecentChats: string[] | undefined) => {
  if (!listRecentChats) {
    return <div> error...</div>;
  }
  console.log(listRecentChats);
  return (
    <div>
      {listRecentChats.map((chat, index) => (
        <div key={index}>{chat}</div>
      ))}
    </div>
  );
};

export const RecentChats = () => {
  const [listRecentChats, setListRecentChats] = useState<
    string[] | undefined
  >();
  const { user, isAuthenticated, loading, login } = useAuth();
  if (loading) {
    return <div>Loading..</div>;
  }
  const AuthGate = authenticateGate(login, isAuthenticated, user);
  if (AuthGate) {
    return AuthGate;
  }
  if (!user?.oid) {
    return <div>error</div>;
  }
  useEffect(() => {
    (async () => {
      const listRecentChats = await fetchRecentChats(user?.oid);
      setListRecentChats(listRecentChats);
    })();
  }, [user?.oid]);

  return ShowTable(listRecentChats);
};
