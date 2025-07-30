import {
  HttpRequest,
  HttpResponseInit,
  input,
  InvocationContext,
  output,
} from "@azure/functions";
import { connect } from "http2";

export const cosmosInputMetaData = input.cosmosDB({
  connection: "CosmosDBConnection",
  databaseName: "Database-ziaadsChatbot",
  containerName: "cosmos-container-user-meta-data",
  partitionKey: "{userid}",
});

export const cosmosInputChats = input.cosmosDB({
  connection: "CosmosDBConnection",
  databaseName: "Database-ziaadsChatbot",
  containerName: "cosmos-container-chats",
  partitionKey: "{userid}",
});

export const cosmosOutputMetaData = output.cosmosDB({
  connection: "CosmosDBConnection",
  databaseName: "Database-ziaadsChatbot",
  containerName: "cosmos-container-chats",
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
  const action = request.params.action;
  const userid = request.params.userid;

  if (action === "fetch" && userid) {
    return fetchUserRecentsInformation;
  } else if (action === "exists" && userid) {
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
    body: JSON.stringify({
      error: "Invalid request parameters or method",
      expectedFormat:
        "/api/userMetaData/{action}/{userid} where action is 'fetch' or 'exists'",
    }),
  });
};

const insertOIDInDB = (request: HttpRequest, context: InvocationContext) => {
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
  // Get OID from route parameter (for the existence check)
  const oid = request.params.userid;

  // Use the bindings that query by userid (which contains the OID for existence checks)
  const userFoundInMetaData = context.extraInputs.get(
    cosmosInputMetaData
  ) as metaDataStructure[];
  const userFoundInChats = context.extraInputs.get(
    cosmosInputChats
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

  // Get userid from route parameter first, then query parameter
  const userid = request.params.userid || request.query.get("userid");

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
