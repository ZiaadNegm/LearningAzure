import { randomUUID } from "crypto";
import {
  HttpRequest,
  HttpResponseInit,
  input,
  InvocationContext,
  output,
} from "@azure/functions";

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

export const cosmosOutputChats = output.cosmosDB({
  connection: "CosmosDBConnection",
  databaseName: "Database-ziaadsChatbot",
  containerName: "cosmos-container-chats",
});

export const cosmosOutputMetaData = output.cosmosDB({
  connection: "CosmosDBConnection",
  databaseName: "Database-ziaadsChatbot",
  containerName: "cosmos-container-user-meta-data",
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

const insertOIDInDB = async (
  request: HttpRequest,
  context: InvocationContext
) => {
  try {
    const userData = await request.json();
    context.log(`[DEBUG] received request.json`);

    // Validate that oid exists in the request body
    if (
      !userData ||
      typeof userData !== "object" ||
      !("oid" in userData) ||
      typeof userData.oid !== "string"
    ) {
      context.log(
        `[DEBUG] OID doesn't exist in the body or the type isn't the request`
      );
      return {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing or invalid oid in request" }),
      };
    }

    const metaDataDocument: metaDataStructure = {
      id: randomUUID(),
      userid: userData.oid,
      metadata: [],
    };

    const chatDocument: containerChats = {
      id: randomUUID(),
      userid: userData.oid,
      title: "",
      messages: [],
    };

    context.log(`[DEBUG] Outputs are set with the document and the document`);
    context.extraOutputs.set(cosmosOutputMetaData, metaDataDocument);
    context.extraOutputs.set(cosmosOutputChats, chatDocument);

    return {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "User added successfully",
        userid: userData.oid,
      }),
    };
  } catch (error) {
    context.error("Error in insertOIDInDB:", error);
    return {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
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
