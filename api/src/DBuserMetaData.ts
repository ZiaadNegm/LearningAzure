import {
  app,
  HttpRequest,
  HttpResponseInit,
  input,
  InvocationContext,
} from "@azure/functions";
import { Metadata } from "openai/resources/shared";

const cosmosInput = input.cosmosDB({
  connection: "CosmosDBConnection",
  databaseName: "Database-ziaadsChatbot",
  containerName: "cosmos-container-user-meta-data",
  sqlQuery: "SELECT * from c WHERE c.userid = {params.userid}",
});

interface metaDataStructure {
  id: string;
  userid: string;
  metadata: string[];
}

export async function userMetaData(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const items = context.extraInputs.get(cosmosInput) as metaDataStructure[];

  // Get userid from query parameters
  const url = new URL(request.url);
  const userid = url.searchParams.get("userid");

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
}

app.http("userMetaData", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  extraInputs: [cosmosInput],
  handler: userMetaData,
});
