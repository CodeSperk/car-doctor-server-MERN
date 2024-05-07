require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// const USER_NAME = inbxmahbub
// const USER_PASS = je1skoCbAz8UWhXI


//middleware 
app.use(cors());
app.use(express.json());


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
      app.get("/bookings", async (req, res) => {
        console.log(req.query);
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