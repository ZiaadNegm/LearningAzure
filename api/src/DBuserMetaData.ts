import {
  HttpRequest,
  HttpResponseInit,
  input,
  InvocationContext,
} from "@azure/functions";
import { Metadata } from "openai/resources/shared";
import { getHeapCodeStatistics } from "v8";

enum queryParameters {
  USERID = "userid",
  DOESTHISUSEREXIST = "useridExists",
}

export const cosmosInputChatCheckUserID = input.cosmosDB({
  connection: "CosmosDBConnection",
  databaseName: "Database-ziaadsChatbot",
  containerName: "cosmos-container-chats",
  partitionKey: "{Query.useridExists}",
});

export const cosmosInputMetaCheckUserID = input.cosmosDB({
  connection: "CosmosDBConnection",
  databaseName: "Database-ziaadsChatbot",
  containerName: "cosmos-container-user-meta-data",
  partitionKey: "{Query.useridExists}",
});

export const cosmosInputMetaData = input.cosmosDB({
  connection: "CosmosDBConnection",
  databaseName: "Database-ziaadsChatbot",
  containerName: "cosmos-container-user-meta-data",
  partitionKey: "{Query.userid}",
});

export const cosmosInputChats = input.cosmosDB({
  connection: "CosmosDBConnection",
  databaseName: "Database-ziaadsChatbot",
  containerName: "cosmos-container-chats",
  partitionKey: "{Query.userid}",
});

interface metaDataStructure {
  id: string;
  userid: string;
  metadata: string[];
}

interface containerChats {
  id: string;
  userid: string;
  title: string;
  messages: string[];
}

const decideActionPath = (request: HttpRequest) => {
  if (request.query.has(queryParameters.USERID)) {
    return fetchUserRecentsInformation;
  } else if (request.query.has(queryParameters.DOESTHISUSEREXIST)) {
    if (request.method === "GET") {
      return checkIfOIDPresentInDB;
    } else if (request.method === "POST") {
      return insertOIDInDB;
    }
  }

  // Default case - return a function that sends a 400 Bad Request
  return (request: HttpRequest, context: InvocationContext) => ({
    status: 400,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Invalid request parameters or method" }),
  });
};

const insertOIDInDB = (request: HttpRequest, context: InvocationContext) => {
  // TODO: Implement logic to insert new user into both containers
  // You'll need Cosmos DB output bindings for this
  return {
    status: 501,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Insert operation not yet implemented" }),
  };
};

const checkIfOIDPresentInDB = (
  request: HttpRequest,
  context: InvocationContext
) => {
  const userFoundInMetaData = context.extraInputs.get(
    cosmosInputMetaCheckUserID
  ) as metaDataStructure[];
  const userFoundInChats = context.extraInputs.get(
    cosmosInputChatCheckUserID
  ) as containerChats[];
  if (userFoundInChats.length === 0 && userFoundInMetaData.length === 0) {
    return {
      status: 404,
    };
  }
  return {
    status: 200,
  };
};

const fetchUserRecentsInformation = (
  request: HttpRequest,
  context: InvocationContext
) => {
  const items = context.extraInputs.get(
    cosmosInputMetaData
  ) as metaDataStructure[];

  const userid = request.query.get("userid");

  if (!items || items.length === 0) {
    return {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oid: userid || "",
        metaData: [],
      }),
    };
  } else {
    // Extract all metadata arrays and flatten them
    const allMetadata: string[] = [];
    items.forEach((item) => {
      allMetadata.push(...item.metadata);
    });

    return {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oid: userid || "",
        metaData: allMetadata,
      }),
    };
  }
};

export async function userMetaData(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const functionToExecute = decideActionPath(request);
  return functionToExecute(request, context);
}
