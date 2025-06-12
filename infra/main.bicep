@description('User meta container containing, user-id, chat-titles (last used)')
@maxLength(200)
param containerName string = 'cosmos-container-user-meta-${resourceGroup().name}'

param accountName string = 'cosmos-ChatBot-Account'

param databaseName string = 'Database-ziaadsChatbot'

@description('Location for the Cosmos DB Account')
param location string = resourceGroup().location

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2025-05-01-preview' = {
  name: toLower(accountName)
  location: location
  properties: {
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    databaseAccountOfferType: 'Standard'
  }
}

resource DatabaseZiaadsChatbot 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2025-05-01-preview' = {
  parent: cosmosAccount
  name: databaseName
  properties: { resource: { id: databaseName } }
}

Microsoft.DocumentDB/databaseAccounts/sqlDatabases
resource ContaineruserMetaData 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-05-01-preview' = {}
