import React from "react";

export interface TextInputProps {
  currentInput: string;
  setCurrentInput: React.Dispatch<React.SetStateAction<string>>;
  updateConversation: (promptText: string, response: string) => void;
}

export const sendPrompt = (prompt: string) => {
  return fetch(`/api/ChatFunction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
};

const startLoginFlow = () => {
  window.location.assign("/login");
};

export const sendInput = async (prompt: string) => {
  try {
    const res = await sendPrompt(prompt);
    if (res.status === 401) {
      startLoginFlow();
    }
    if (!res.ok) {
      throw new Error(
        `Response is not ok: HTTP ${res.status}: ${res.statusText}`
      );
    }
    // Get the raw response text first
    const rawText = await res.text();
    // Check if it's empty
    if (!rawText || rawText.trim() === "") {
      throw new Error("Server returned empty response");
    }

    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw text that failed to parse:", rawText);
      throw new Error(
        `Failed to parse response as JSON: ${
          parseError instanceof Error ? parseError.message : String(parseError)
        }`
      );
    }

    console.log("Parsed response data:", responseData);

    const { filteredResponse } = responseData;
    console.log("Extracted filteredResponse:", filteredResponse);

    if (!filteredResponse) {
      throw new Error("Server returned empty result");
    }

    return filteredResponse;
  } catch (err) {
    console.error("Fetch Error:", err);
    throw err;
  }
};

export const TextInput = ({
  currentInput,
  setCurrentInput,
  updateConversation,
}: TextInputProps) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitting", currentInput);
    setCurrentInput("");

    try {
      console.log("About to call sendInput");
      const response = await sendInput(currentInput);
      console.log("sendInput returned:", response);

      // Update with the actual response
      updateConversation(currentInput, response);
    } catch (error) {
      if (error instanceof Error) {
        updateConversation(currentInput, `Error: ${error.message}`);
      }
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
