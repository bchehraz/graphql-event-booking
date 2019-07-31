const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const schema = require('./graphql/schema/index');
const resolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(isAuth);

app.use(
  '/graphql',
  graphqlHttp({
    schema: schema,
    rootValue: resolvers,
    graphiql: true,
  })
);

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-g2cr6.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority
    `
  )
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
