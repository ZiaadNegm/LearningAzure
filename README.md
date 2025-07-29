## Learning Azure

This directory is setup with the goal of learning Azure. 

* Chatbot

## Done las time:
* Implemented proepr authentication in such a way so that the frontend has access to the ms-principal. (verified)
* Setup IaC for cosmosDB (verified)
* Restructure Chatinput.tsx as this violates the single responsibilty rule.
* Functionapp is irrelevant but the principalID is linked for a RBAC, how does this make sense?
* Ensure Application Insights is setup correctly by hands on testing.
* Clean up dummy resources.
* Implement a dummy function to retrieve data from cosmosDB based upon the retrieved oid
* Ease local testing by making a Warp Workflow.
* Note the steps from A - Z to setup the Database + Function under SWA connection again.

## Todo:
* Find out more about loggin in my host.json
* Find out why we first see Error for 5 seconds before we see the recent chats.
* Make GUI for recent chats look okay.
* Think about when we insert a record in RecentChats.
* Have we defined a record of a chat?
