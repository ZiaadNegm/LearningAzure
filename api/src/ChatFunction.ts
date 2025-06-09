import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { OpenAI } from "openai";
interface ChatRequest {
  prompt: string;
}

// Authentication & Security Module
const extractClientPrincipal = (
  request: HttpRequest,
  context: InvocationContext
): string | null => {
  const principal = request.headers.get("x-ms-client-principal");
  if (!principal) {
    context.log("No x-ms-client-principal found");
  } else {
    context.log(principal);
  }
  return principal;
};

// Request Validation Module
const parseAndValidateRequest = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<ChatRequest> => {
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (parseError) {
    context.error("Failed to parse JSON:", parseError);
    throw new Error("Invalid JSON format");
  }

  const { prompt } = requestBody as { prompt: string };

  if (!prompt?.trim()) {
    context.log("Empty or missing prompt");
    throw new Error("Prompt is required and cannot be empty");
  }

  return { prompt };
};

// OpenAI Service Module
const createOpenAIClient = (context: InvocationContext): OpenAI => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    context.error("No API key found");
    throw new Error("No api key found");
  }
  return new OpenAI({ apiKey });
};

const generateChatResponse = async (
  prompt: string,
  context: InvocationContext
): Promise<string> => {
  const openai = createOpenAIClient(context);
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response content from OpenAI");
  }

  return content;
};

// Error Response Module
const createErrorResponse = (
  status: number,
  message: string,
  details?: string
): HttpResponseInit => ({
  status,
  jsonBody: details ? { error: message, details } : { error: message },
});

const createSuccessResponse = (content: string): HttpResponseInit => ({
  status: 200,
  jsonBody: { filteredResponse: content },
});

// Main Function
export async function ChatFunction(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Processing request for URL: "${request.url}"`);

  // Extract client principal for authentication/logging
  extractClientPrincipal(request, context);

  try {
    // Parse and validate request
    const { prompt } = await parseAndValidateRequest(request, context);
    context.log(`Received prompt: ${prompt}`);

    // Generate AI response
    const content = await generateChatResponse(prompt, context);
    return createSuccessResponse(content);
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message;

      // Handle specific error types
      if (message.includes("JSON") || message.includes("Prompt is required")) {
        return createErrorResponse(400, message);
      }

      if (message.includes("OpenAI") || message.includes("api key")) {
        context.error("OpenAI API error:", error);
        return createErrorResponse(500, "Failed to generate response", message);
      }
    }

    // Handle unexpected errors
    context.error("Unexpected error:", error);
    return createErrorResponse(500, "Internal server error");
  }
}

app.http("ChatFunction", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: ChatFunction,
});
