import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { OpenAI } from "openai";

interface OpenAIConfiguration {
  apiKey: string;
}

const createOpenAIClient = (context: InvocationContext) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    context.error("No API key found");
    throw new Error("No api key found");
  }
  return new OpenAI({ apiKey });
};

export async function ChatFunction(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Processing request for URL: "${request.url}"`);

  const principal = request.headers.get("x-ms-client-principal");
  if (!principal) {
    context.log("No x-ms-client-principal found");
  }
  context.log(principal);

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      context.error("Failed to parse JSON:", parseError);
      return {
        status: 400,
        jsonBody: { error: "Invalid JSON format" },
      };
    }

    const { prompt } = requestBody as { prompt: string };

    if (!prompt?.trim()) {
      context.log("Empty or missing prompt");
      return {
        status: 400,
        jsonBody: { error: "Prompt is required and cannot be empty" },
      };
    }

    context.log(`Received prompt: ${prompt}`);

    try {
      const openai = createOpenAIClient(context);
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content from OpenAI");
      }

      return {
        status: 200,
        jsonBody: { filteredResponse: content },
      };
    } catch (openaiError) {
      context.error("OpenAI API error:", openaiError);
      return {
        status: 500,
        jsonBody: { error: "Failed to generate response" },
      };
    }
  } catch (error) {
    context.error("Unexpected error:", error);
    return {
      status: 500,
      jsonBody: { error: "Internal server error" },
    };
  }
}

app.http("ChatFunction", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: ChatFunction,
});
