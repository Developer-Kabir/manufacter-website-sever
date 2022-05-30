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
    jwt.verify(token, process.env.TOKEN, function (err, decoded) {
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
      const orderCollection = client.db('autoparts').collection('order');
      const userCollection = client.db('autoparts').collection('user');
      const reviewCollection = client.db('autoparts').collection('review');
      
  

      const verifyAdmin = async (req, res, next) => {
        const requester = req.decoded.email;
        const requesterAccount = await userCollection.findOne({ email: requester });
        if (requesterAccount.role === 'admin') {
          next();
        }
        else {
          res.status(403).send({ message: 'forbidden' });
        }
      }
      
      // get
      app.get('/parts', async (req, res) => {
        const query = {};
        const cursor = partsCollection.find(query);
        const parts = await cursor.toArray();
        res.send(parts);
    });

    // getting review
      app.get('/review',  async (req, res) => {
        const query = {};
        const cursor = reviewCollection.find(query);
        const review = await cursor.toArray();
        res.send(review);
    });



    app.get('/parts/:id' , async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const item = await partsCollection.findOne(query);
        res.send(item);
    });


    app.get('/order', async (req, res) => {
        const query = {};
        const cursor = orderCollection.find(query);
        const parts = await cursor.toArray();
        res.send(parts);
    });


       // post
    app.post('/order', async (req, res) => {
        const newItem = req.body;
        const result = await orderCollection.insertOne(newItem);
        res.send(result)
    });


    //  review post 
       // post
       app.post('/review', async (req, res) => {
        const newItem = req.body;
        const result = await reviewCollection.insertOne(newItem);
        res.send(result)
    });



    app.get('/user',  async (req, res) => {
        const users = await userCollection.find().toArray();
        res.send(users);
    });
    app.post('/user',  async (req, res) => {
        const users = await userCollection.find().toArray();
        res.send(users);
    });

        app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin })
    })

    app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign({ email: email }, process.env.TOKEN, { expiresIn: '1h' })
        res.send({ result, token });
      })

  
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