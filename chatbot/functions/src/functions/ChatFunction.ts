import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

export async function ChatFunction(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  try {
    const requestBody: any = await request.json();
    const prompt: any = requestBody?.prompt;

    if (prompt) {
      context.log(`Received prompt: ${prompt}`);
    } else {
      context.log("Prompt nogt find in request body");

      return { status: 200, body: "Recieved your prompt." };
    }
  } catch (error) {
    context.error("Error processing request", error);
    return {
      status: 400,
      body: "Could notparse the request body",
    };
  }
}

app.http("ChatFunction", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: ChatFunction,
});
