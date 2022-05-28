const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send('Hello From Elegent Autoparts')
  })
  
  app.listen(port, () => {
    console.log(`Elegent Autoparts listening on port ${port}`)
  })