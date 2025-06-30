import {
  app,
  HttpRequest,
  HttpResponseInit,
  input,
  InvocationContext,
} from "@azure/functions";

const cosmosInput = input.cosmosDB({
    databaseName: '',
    collectionName '',
    id: '',
    partitionKey:''
     // Connectionstring?
})

export async function userMetaDataHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit>{

}

app.http('DBuserMetaData',
{methods:['GET', 'POST'],}

 )