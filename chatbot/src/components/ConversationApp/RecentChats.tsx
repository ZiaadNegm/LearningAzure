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
        <div
          key={index}
          className="bg-black text-white px-4 py-3 my-2 rounded-full cursor-pointer transition-colors duration-200 hover:bg-gray-700"
        >
          {chat}
        </div>
      ))}
    </div>
  );
};

export const RecentChats = () => {
  const [listRecentChats, setListRecentChats] = useState<
    string[] | undefined
  >();
  const { user, isAuthenticated, loading, login } = useAuth();

  // Move useEffect to the top, before any conditional returns
  useEffect(() => {
    // Only fetch if user exists and has oid
    if (user?.oid) {
      (async () => {
        try {
          const listRecentChats = await fetchRecentChats(user.oid);
          setListRecentChats(listRecentChats);
        } catch (error) {
          console.error("Failed to fetch recent chats:", error);
          setListRecentChats([]); // Set empty array on error
        }
      })();
    }
  }, [user?.oid]);

  // Now handle conditional renders after all hooks
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

  return ShowTable(listRecentChats);
};
