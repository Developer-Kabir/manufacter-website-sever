const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-shard-00-00.hkeao.mongodb.net:27017,cluster0-shard-00-01.hkeao.mongodb.net:27017,cluster0-shard-00-02.hkeao.mongodb.net:27017/?ssl=true&replicaSet=atlas-7i6kd9-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: 'Forbidden access' })
      }
      req.decoded = decoded;
      next();
    });
  }



async function run() {
    try {
      await client.connect();
      const partsCollection = client.db('autoparts').collection('tools');
      
  
      
      // get
      app.get('/parts', async (req, res) => {
        const query = {};
        const cursor = partsCollection.find(query);
        const parts = await cursor.toArray();
        res.send(parts);
    });

    app.get('/parts/:id' , async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const item = await partsCollection.findOne(query);
        res.send(item);
    });


      
  
    }
    finally {
  
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello From Elegent Autoparts')
  })
  
  app.listen(port, () => {
    console.log(`Elegent Autoparts listening on port ${port}`)
  })