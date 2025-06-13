import { Routes, Route } from "react-router-dom";
import { ChatWindow } from "./components/ChatWindow";
import { LoginPage, LogoutPage } from "./loginPage";

const RoutesDefined = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatWindow />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
    </Routes>
  );
};

export default RoutesDefined;
