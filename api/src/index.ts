import { app } from "@azure/functions";
import { cosmosInput } from "./DBuserMetaData";
import { userMetaData } from "./DBuserMetaData";
import { ChatFunction } from "./ChatFunction";

app.http("userMetaData", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  extraInputs: [cosmosInput],
  handler: userMetaData,
});

app.http("ChatFunction", {
  methods: ["POST"],    
  authLevel: "anonymous",
  handler: ChatFunction,
});
