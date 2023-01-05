# Craft Demo - Network call optimiser

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run serve-json`

Start JSON Server - use http://localhost:3030 to connect to the server on local
The server is deployed at [https://craft-demo-server.vercel.app](Vercel).

## Project Idea 
### Problem statement
Path - <b>network-call-optimiser\SSE UI Craft demo.pdf</b>

### Intuition
As the problem tells, the dependencies can be dynamic, we will try to build a dynamic UI so that the dependencies can be resolved on the client and we will be able to update only the required dependant entities when required.

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
### Dependency Graph 

![image](https://user-images.githubusercontent.com/55315778/210706255-a2252edd-7fac-40ad-ba8e-ec8cfdcbe6ae.png)

<b>Algo used to resolve dependencies - Topological sort using DFS</b>

We can use Topo sort when :-
1. It is a directed graph.
2. There is no cyclic dependency in the graph. 

Why we want to use Topo sort? 
1. Tells if the dependency array is valid or not by checking for a cycle in the graph.
2. Gives the <b> topologically sorted entities</b> so that all the dependant entities are rendered as per their dependency order.
   example - "transactions" will render(fetch data) only after we have the "accounts" entity rendered(data fetched). This is because "transactions" is dependant on   "accounts"
3. Gives the <b>adjacency list</b> - a map like DS to map each entitiy to the entities pointing to it in the dependency graph.
   example - if "accounts" is changed from acc_1 to acc_2 -> "transactions" will be refreshed for acc_2
   
   ![image](https://user-images.githubusercontent.com/55315778/210562084-529eddfc-d2f4-47eb-b434-e10e3df81ef8.png)
   
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
![image](https://user-images.githubusercontent.com/55315778/210561864-4b2c3794-a100-46c8-8c63-5e11cb3ad73b.png)


### Working of the application


https://user-images.githubusercontent.com/55315778/210261301-2663c313-d73e-4125-a667-fb8f659da02a.mp4


