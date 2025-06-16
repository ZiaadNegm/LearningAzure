export interface UserMetaData {
  oid: string;
  userDetails?: string;
  identityProvider?: string;
}

export interface UseChatSubmitProps {
  updateConversation: (promptText: string, response: string) => void;
  onInputClear?: () => void;
}

export interface TextInputProps {
  currentInput: string;
  setCurrentInput: React.Dispatch<React.SetStateAction<string>>;
  updateConversation: (promptText: string, response: string) => void;
}

export interface InputFormProps {
  currentInput: string;
  setCurrentInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (input: string) => Promise<void>;
}
export interface ChatApiResponse {
  filteredResponse: string;
}
