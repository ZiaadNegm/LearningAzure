import type { ChatApiResponse } from "../types/chat";
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

const validateAndExtractResponse = async (
  response: Response
): Promise<string> => {
  if (!response.ok) {
    throw new ChatApiError(
      `Response is not ok: HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  const rawText = await response.text();

  if (!rawText || rawText.trim() === "") {
    throw new ChatApiError("Server returned empty response");
  }

  return rawText.trim();
};

const parseAndExtractFilteredResponse = (rawText: string): string => {
  let responseData: ChatApiResponse;
  try {
    responseData = JSON.parse(rawText);
  } catch (parseError) {
    console.error("JSON parse error:", parseError);
    console.error("Raw text failed to parse:", rawText);
    throw new ChatApiError(
      `Failed to parse response as JSON ${
        parseError instanceof Error ? parseError.message : String(parseError)
      }`
    );
  }

  console.log("Parsed response data:", responseData);

  const { filteredResponse } = responseData;
  console.log("Extracted filteredResponse:", filteredResponse);

  if (!filteredResponse) {
    throw new ChatApiError("Server returned empty result");
  }

  return filteredResponse;
};

// Get raw response and validate.
// Check for full response -> ParseError check -> extract filteredresponse
export const sendInput = async (prompt: string): Promise<string> => {
  try {
    const res = await sendPrompt(prompt);
    const rawText = await validateAndExtractResponse(res);
    const filteredResponse = parseAndExtractFilteredResponse(rawText);
    console.log("sendInput completed successfully");
    return filteredResponse;
  } catch (err) {
    console.error("Fetch Error:", err);
    if (err instanceof ChatApiError) {
      throw err;
    }
    throw new ChatApiError(
      err instanceof Error ? err.message : "Unknown error occurred in SendInput"
    );
  }
};
