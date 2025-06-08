"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatFunction = void 0;
const functions_1 = require("@azure/functions");
const openai_1 = require("openai");
const createOpenAIClient = (context) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        context.error("No API key found");
        throw new Error("No api key found");
    }
    return new openai_1.OpenAI({ apiKey });
};
function ChatFunction(request, context) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
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
                requestBody = yield request.json();
            }
            catch (parseError) {
                context.error("Failed to parse JSON:", parseError);
                return {
                    status: 400,
                    jsonBody: { error: "Invalid JSON format" },
                };
            }
            const { prompt } = requestBody;
            if (!(prompt === null || prompt === void 0 ? void 0 : prompt.trim())) {
                context.log("Empty or missing prompt");
                return {
                    status: 400,
                    jsonBody: { error: "Prompt is required and cannot be empty" },
                };
            }
            context.log(`Received prompt: ${prompt}`);
            try {
                const openai = createOpenAIClient(context);
                const response = yield openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                });
                const content = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
                if (!content) {
                    throw new Error("No response content from OpenAI");
                }
                return {
                    status: 200,
                    jsonBody: { filteredResponse: content },
                };
            }
            catch (openaiError) {
                context.error("OpenAI API error:", openaiError);
                return {
                    status: 500,
                    jsonBody: { error: "Failed to generate response" },
                };
            }
        }
        catch (error) {
            context.error("Unexpected error:", error);
            return {
                status: 500,
                jsonBody: { error: "Internal server error" },
            };
        }
    });
}
exports.ChatFunction = ChatFunction;
functions_1.app.http("ChatFunction", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: ChatFunction,
});
//# sourceMappingURL=ChatFunction.js.map