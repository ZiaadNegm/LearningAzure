import { useState } from "react";
import { TextInput } from "./ChatInput";

export interface ConversationEntry {
  prompt: string;
  response?: string;
}

export const addEntryToConversation = (
  promptText: string,
  response: string,
  setConversation: React.Dispatch<React.SetStateAction<ConversationEntry[]>>
) => {
  console.log(promptText);
  const newEntry: ConversationEntry = {
    prompt: promptText,
    response: response,
  };
  setConversation((prevConversation) => [...prevConversation, newEntry]);
};

// Renders the Response and Input.
export const ShowConversation = ({
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
export const ChatWindow = () => {
  const [currentInput, setCurrentInput] = useState("");
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);

  const updateConversation = (promptText: string, response: string) => {
    addEntryToConversation(promptText, response, setConversation);
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <TextInput
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        updateConversation={updateConversation}
      />
      <ShowConversation currentConversation={conversation} />
    </div>
  );
};
