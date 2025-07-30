import { app } from "@azure/functions";
import {
  cosmosInputMetaData,
  cosmosInputChats,
  cosmosInputChatCheckUserID,
  cosmosInputMetaCheckUserID,
} from "./DBuserMetaData";
import { userMetaData } from "./DBuserMetaData";
import { ChatFunction } from "./ChatFunction";

app.http("userMetaData", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "userMetaData/{action}/{userid}",
  extraInputs: [
    cosmosInputMetaData,
    cosmosInputChats,
    cosmosInputMetaCheckUserID,
    cosmosInputChatCheckUserID,
  ],
  handler: userMetaData,
});

app.http("ChatFunction", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: ChatFunction,
});
