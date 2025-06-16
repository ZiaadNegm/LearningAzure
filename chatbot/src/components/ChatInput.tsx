import React from "react";
import { useAuth } from "../context/auth";
import { sendInput } from "../apiFunctions/promptAPI";
import type {
  TextInputProps,
  UseChatSubmitProps,
  UserMetaData,
  InputFormProps,
} from "../types/chat";

const showLoadingMenu = () => {
  return <div>Loading...</div>;
};

const authenticateGate = (
  login: () => void,
  isAuthenticated: Boolean,
  user: UserMetaData | null
) => {
  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center">
        <p>Please log in to send messages</p>
        <button
          onClick={login}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Log In
        </button>
      </div>
    );
  } else {
    console.log("User has logged in with the following oid", user?.oid);
  }
};

const InputForm = ({
  currentInput,
  setCurrentInput,
  handleSubmit,
}: InputFormProps) => {
  const finalizeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentInput.trim()) return;
    const inputTosend = currentInput;
    setCurrentInput("");
    await handleSubmit(inputTosend);
  };

  return (
    <div>
      <form onSubmit={finalizeSubmit}>
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

const useChatSubmit = ({
  updateConversation,
  onInputClear,
}: UseChatSubmitProps) => {
  const handleSubmit = async (inputToSend: string) => {
    try {
      console.log("About to call sendInput");
      const response = await sendInput(inputToSend);
      console.log("sendInput returned:", response);
      updateConversation(inputToSend, response);

      onInputClear?.();
    } catch (error) {
      if (error instanceof Error) {
        updateConversation(inputToSend, `Error: ${error.message}`);
      }
      console.error("Failed to send message:", error);
    }
  };

  return { handleSubmit };
};

export const TextInput = ({
  currentInput,
  setCurrentInput,
  updateConversation,
}: TextInputProps) => {
  const { user, isAuthenticated, loading, login } = useAuth();

  const { handleSubmit } = useChatSubmit({
    updateConversation,
    onInputClear: () => setCurrentInput(""),
  });

  if (loading) {
    return showLoadingMenu();
  }

  const authGate = authenticateGate(login, isAuthenticated, user);
  if (authGate) {
    return authGate;
  }

  return (
    <InputForm
      currentInput={currentInput}
      setCurrentInput={setCurrentInput}
      handleSubmit={handleSubmit}
    />
  );
};
