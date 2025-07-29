import { app } from "@azure/functions";
import { cosmosInputMetaData, cosmosInputChats } from "./DBuserMetaData";
import { userMetaData } from "./DBuserMetaData";
import { ChatFunction } from "./ChatFunction";

app.http("userMetaData", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  extraInputs: [cosmosInputMetaData, cosmosInputChats],
  handler: userMetaData,
});

app.http("ChatFunction", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: ChatFunction,
});
