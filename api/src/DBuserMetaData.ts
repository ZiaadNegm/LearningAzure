import {
  HttpRequest,
  HttpResponseInit,
  input,
  InvocationContext,
} from "@azure/functions";
import { Metadata } from "openai/resources/shared";

enum queryParameters {
  USERID = "userid",
  DOESTHISUSEREXIST = "useridExists",
}

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
};

const insertOIDInDB = () => {};

const checkIfOIDPresentInDB = (
  request: HttpRequest,
  context: InvocationContext
) => {
  const userid = request.query.get(queryParameters.DOESTHISUSEREXIST);
  const userFoundInMetaData = context.extraInputs.get(cosmosInputMetaData);
  const userFoundInChats = context.extraInputs.get(cosmosInputChats);

  
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
