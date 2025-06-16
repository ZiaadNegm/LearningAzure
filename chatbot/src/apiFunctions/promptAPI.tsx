export interface ChatApiResponse {
  filteredResponse: string;
}

export class ChatApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ChatApiError";
    this.statusCode = statusCode;
  }
}

export const sendPrompt = (prompt: string) => {
  return fetch(`/api/ChatFunction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    credentials: "include",
  });
};

export const sendInput = async (prompt: string) => {
  try {
    const res = await sendPrompt(prompt);
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
