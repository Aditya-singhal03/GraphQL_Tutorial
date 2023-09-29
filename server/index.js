const express = require('express');
const {ApolloServer} = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const bodyParser = require('body-parser');
const { expressMiddleware } =  require('@apollo/server/express4');
const cors = require('cors');
const { default: axios } = require('axios');

async function startServer(){
    const app = express();

    const typeDefs = `

        type User{
            id: ID!,
            name: String!,
            username: String!,
            email: String!,
            phone: String!,
            website: String!,
        }

        type Todo{
            id:ID!,
            title: String!,
            completed: Boolean!,
            userId: ID!,
            user: User
        }

        type Query{
            getTodos:[Todo]
            getAllUsers:[User]
            getUser(id:ID!):User
        }
    `;

    const resolvers = {
        Todo:{
            user: async (todo) => (await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`)).data
        },
        Query: {
            getTodos: async ()=> (await axios.get("https://jsonplaceholder.typicode.com/todos")).data,
            getAllUsers: async()=> (await axios.get("https://jsonplaceholder.typicode.com/users")).data,
            getUser: async(parent,{id})=> (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)).data,
        }
    }
    
    const server = new ApolloServer({
        typeDefs,
        resolvers
    });

    app.use(bodyParser.json());
    app.use(cors());

    await server.start();

    app.use("/graphql",expressMiddleware(server));

    app.listen(8000,()=> console.log("Server started on port 8000"));
}

startServer();