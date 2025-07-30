import { app } from "@azure/functions";
import {
  cosmosInputMetaData,
  cosmosInputChats,
  cosmosOutputMetaData,
  cosmosOutputChats,
} from "./DBuserMetaData";
import { userMetaData } from "./DBuserMetaData";
import { ChatFunction } from "./ChatFunction";
import { ChatCompletionStoreMessagesPage } from "openai/resources/chat";

app.http("userMetaData", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "userMetaData/{action}/{userid}",
  extraInputs: [cosmosInputMetaData, cosmosInputChats],
  extraOutputs: [cosmosOutputMetaData, cosmosOutputChats],
  handler: userMetaData,
});

app.http("ChatFunction", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: ChatFunction,
});
