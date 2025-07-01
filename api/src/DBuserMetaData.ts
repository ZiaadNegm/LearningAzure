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
  sqlQuery: "SELECT * from c WHERE c.userid = {query.userid}",
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
  if (!items || items.length === 0) {
    return {
      status: 404,
      body: "ToDo item not found",
    };
  } else {
    const lines: string[] = [];
    items.forEach((items) => {
      const metaLine = items.metadata.join(",");
      lines.push(`User ${items.userid} metadata: ${metaLine}`);
    });

    return {
      body: `Found ${items.length} record(s): ${lines.join("\n")}`,
    };
  }
}

app.http("userMetaData", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  extraInputs: [cosmosInput],
  handler: userMetaData,
});
