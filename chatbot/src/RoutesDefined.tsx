import { Routes, Route } from "react-router-dom";
import { ChatWindow } from "./components/ChatWindow";
import LoginPage from "./loginPage";

const RoutesDefined = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatWindow />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
};

export default RoutesDefined;
