import "./App.css";
import { ChatWindow } from "./components/ChatWindow";

const base = import.meta.env.VITE_API_BASE_URL;

if (!base) {
  throw new Error("VITE_API_BASE_URL is not defined.");
}

function App() {
  return <ChatWindow />;
}

export default App;
