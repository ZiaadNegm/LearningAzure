import { useState } from "react";
import "./App.css";

interface TextInputProps {
  currentInput: string;
  setCurrentInput: React.Dispatch<React.SetStateAction<string>>;
  updateConversation: (promptText: string) => void;
}

interface ConversationEntry {
  prompt: string;
  response?: string;
}

const addEntryToConversation = (
  promptText: string,
  setConversation: React.Dispatch<React.SetStateAction<ConversationEntry[]>>
) => {
  const newEntry: ConversationEntry = { prompt: promptText };
  setConversation((prevConversation) => [...prevConversation, newEntry]);
};

// Renders the Response and Input.
const ShowConversation = ({
  currentConversation,
}: {
  currentConversation: ConversationEntry[];
}) => {
  return (
    <div>
      <ul>
        {currentConversation.map((entry, index) => (
          <li key={index}>
            <p>You: {entry.prompt}</p>
            {entry.response && <p>Response: {entry.response} </p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

/*
  Main parent of states. Renders TextInput and ShowConversation
*/
const ChatWindow = () => {
  const [currentInput, setCurrentInput] = useState("");
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);

  const updateConversation = (promptText: string) => {
    addEntryToConversation(promptText, setConversation);
  };
  return (
    <div>
      <TextInput
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        updateConversation={updateConversation}
      />
      <ShowConversation currentConversation={conversation} />
    </div>
  );
};

const sendInput = async (prompt: string) => {
  try {
    const res = await fetch("http://localhost:7071/api/ChatFunction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const body = (await res).json();
    console.log(body);
  } catch (err) {
    console.error("Fetc Error:", err);
  }
};

const TextInput = ({
  currentInput,
  setCurrentInput,
  updateConversation,
}: TextInputProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(currentInput);
    updateConversation(currentInput);
    sendInput(currentInput);
    setCurrentInput("");
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="rounded-2xl border-black border"
          placeholder="Type your message"
          value={currentInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCurrentInput(e.target.value)
          }
        />
      </form>
    </div>
  );
};

export default ChatWindow;
