@description('User meta container containing, user-id, chat-titles (last used)')
@maxLength(200)
param metaContainerName string = 'cosmos-container-user-meta-data'

param chatContainerName string = 'cosmos-container-chats'

param accountName string = 'cosmos-ChatBot-Account'

param databaseName string = 'Database-ziaadsChatbot'

param cosmosInsightSetting string = 'Cosmos-Insight-ChatBot'

param existingSWAInsights string = 'ZiaadsChatbot'

@description('Location for the Cosmos DB Account')
param location string = resourceGroup().location

var workspaceResourceID = SWAInsights.properties.WorkspaceResourceId

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

resource ContaineruserMetaData 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-05-01-preview' = {
  parent: DatabaseZiaadsChatbot
  name: metaContainerName
  properties: {
    resource: {
      id: metaContainerName
      partitionKey: {
        paths: [
          '/userid'
        ]
        kind: 'Hash'
      }
    }
    options: {
      throughput: 400
    }
  }
}

resource ContainerChats 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-05-01-preview' = {
  parent: DatabaseZiaadsChatbot
  name: chatContainerName
  properties: {
    resource: {
      id: chatContainerName
      partitionKey: {
        paths: [
          '/userid'
        ]
        kind: 'Hash'
      }
      uniqueKeyPolicy: {
        uniqueKeys: [
          { paths: ['/conversationID'] }
        ]
      }
    }
    options: {
      throughput: 400
    }
  }
}

resource SWAInsights 'Microsoft.Insights/components@2020-02-02' existing = { name: existingSWAInsights }

resource cosmosInsights 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  scope: cosmosAccount
  name: cosmosInsightSetting
  properties: {
    workspaceId: workspaceResourceID
    logs: [
      {
        categoryGroup: 'allLogs'
        enabled: true
      }
    ]
    metrics: [
      { category: 'AllMetrics', enabled: true }
    ]
  }
}
