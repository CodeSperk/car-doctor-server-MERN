require("dotenv").config();
const express = require("express");
const cors = require("cors");
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// const USER_NAME = inbxmahbub
// const USER_PASS = je1skoCbAz8UWhXI


//middleware 
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// middlewares
const logger = (req, res, next) => {
  console.log('log info:', req.method, req.url);
  console.log('This is cookies', req.cookies);
  next();
}

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log('token in the middleware', token);
  //if no token found
  if(!token){
    return res.status(401).send({message: 'unauthorized access'});
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if(err){
      return res.status(401).send({message: 'unauthorized access'})
    }
    req.user = decoded;
    next();
  })
}


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster1.fi7xib0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const serviceCollection = client.db("carDoctorDB").collection("services");
    const bookingsCollection = client.db("carDoctorDB").collection("bookings");

//auth related  api
app.post('/jwt', async(req, res) => {
  const user = req.body;
  console.log('user for token', user);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
  res
    .cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite:'none'
    } )
    .send({success: true})
})

// to clear cookie after logout
app.post('/logout', async(req, res) => {
  const user = req.body;
  console.log('logging out ', user);
  res.clearCookie('token', {maxAge: 0}).send({success:true})
});

// Services
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/service/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    app.get("/bookService/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const options ={
        projection: {title:1, img:1, price:1, service_id:  1 }
      }
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    })
      // Bookings
      app.get("/bookings", logger, verifyToken, async (req, res) => {
        console.log(req.query.email);

        console.log('token owner info', req.user);
        if(req.user.email !== req.query.email){
          return res.status(403).send({message: 'forbidden access'})
        }

        let query = {};
        if(req.query?.email){
          query = {email: req.query.email}
        }
        const cursor = bookingsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      })
      
      app.post("/bookings", async (req, res) => {
        const booking = req.body;
        const result = await bookingsCollection.insertOne(booking);
        res.send(result);
      })

      app.delete('/bookings/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await bookingCollection.deleteOne(query);
        res.send(result);
      })    

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Welcome to backend");
})
app.listen(port, () => {
  console.log("Server is running on", port);
})