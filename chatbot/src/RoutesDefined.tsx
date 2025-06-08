import { Routes, Route } from "react-router-dom";
import ChatWindow from "./App";

const RoutesDefined = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatWindow />} />
    </Routes>
  );
};

export default RoutesDefined;
