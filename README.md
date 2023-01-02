# Craft Demo - Network call optimiser

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run serve-json`

Start JSON Server - use http://localhost:3030 to connect to the server on local
The server is deployed at [https://craft-demo-server.vercel.app](Vercel).

## Project Idea 
### Problem statement
Path - <b>network-call-optimiser\SSE UI Craft demo.pdf</b>

### Intuition
As the problem tells, the depencies can be dynamic, we will try to build a dynamic UI so that the depencies can be resolved on the client and we will be able to update only the required dependant entities when required.

For example the dependency of entities coming from the server is as below:-
```
"dependencies": {
    "transactions": [
      "accounts"
    ],
    "trends": [
      "transactions",
      "budgets"
    ]
}
```
<b>Algo used to resolve dependencies - Topological sort using DFS</b>

Why ? 
1. Gives the <b>entities topologically sorted</b> so that all the dependant entities are rendered after the entities they are dependant on are resolved.
   example - "transactions" will render only after we have the "accounts" entity rendered as we are sending selected account id in the transactions get api call.
2. Gives the <b>adjacency list</b> - gives the dependant entities to be refreshed on the selection change of one entity
   example - if "accounts" is changed from acc_1 to acc_2 -> "transactions" will be refreshed for acc_2
   
```
adjacency: {
    accounts: [
      'transactions'
    ],
    transactions: [
      'trends'
    ],
    budgets: [
      'trends'
    ],
    trends: [],
    tags: []
}
  ```
### API calls for the given dependencies

<b> GET Calls </b>
1. accounts - GET /accounts
2. transactions - GET /transactions?accountId={account_id}
3. budgets - GET /budgets
4. trends - GET /trends?transactionId={transaction_id}&budgetId={budget_id}
5. tags - GET /tags

<b> Other Calls </b>
type can be - accounts, transactions, tags, budgets, trends

POST - /{type} with JSON data
PUT - /{type}/{id} with JSON data
DELETE - /{type}/{id}

#### The Flow diagram of the current dependencies :-

![image](https://user-images.githubusercontent.com/55315778/210150617-b7062ff6-c1a1-41ce-b746-27725c581fff.png)

### Working of the application



https://user-images.githubusercontent.com/55315778/210261301-2663c313-d73e-4125-a667-fb8f659da02a.mp4


