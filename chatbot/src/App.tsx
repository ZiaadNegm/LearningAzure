import { useState } from "react";
import "./App.css";

interface TextInputProps {
  currentInput: string;
  setCurrentInput: React.Dispatch<React.SetStateAction<string>>;
  updateConversation: (promptText: string, response: string) => void;
}

interface ConversationEntry {
  prompt: string;
  response?: string;
}

const addEntryToConversation = (
  promptText: string,
  response: string,
  setConversation: React.Dispatch<React.SetStateAction<ConversationEntry[]>>
) => {
  const newEntry: ConversationEntry = {
    prompt: promptText,
    response: response,
  };
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

  const updateConversation = (promptText: string, response: string) => {
    addEntryToConversation(promptText, response, setConversation);
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

const sendPrompt = (prompt: string) => {
  return fetch("http://localhost:7071/api/ChatFunction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
};

const sendInput = async (prompt: string) => {
  try {
    const res = await sendPrompt(prompt);

    if (!res.ok) {
      throw new Error(
        `Response is not ok: HTTP ${res.status}: ${res.statusText}`
      );
    }

    // Get response as text first to check if it's empty
    const rawText = await res.text();

    if (!rawText || rawText.trim() === "") {
      throw new Error("Server returned empty response");
    }

    // Parse the text as JSON
    const filteredResponse = JSON.parse(rawText);

    if (!filteredResponse) {
      throw new Error("Server returned empty result");
    }

    return filteredResponse.response;
  } catch (err) {
    console.error("Fetch Error:", err);
    throw err;
  }
};

const TextInput = ({
  currentInput,
  setCurrentInput,
  updateConversation,
}: TextInputProps) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(currentInput);

    try {
      const response = await sendInput(currentInput);
      updateConversation(currentInput, response);
      setCurrentInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
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
