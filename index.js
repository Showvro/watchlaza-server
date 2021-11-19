const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

//middlewire setup
app.use(cors());
app.use(express.json());

//port and environment variable
const port = process.env.PORT || 9999;

//mongo uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rzdhw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// database connection
async function run() {
  try {
    //make db connection
    await client.connect();
    console.log("DB Connected");

    //database configaretion
    const database = client.db("watchlaza");
    const userCollection = database.collection("users");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");
    const watchesCollection = database.collection("watches");

    // getting product with id
    app.get("/watch/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await watchesCollection.findOne(query);
      res.json(result);
    });

    // getting all the watches
    app.get("/watches", async (req, res) => {
      const limit = +req.query.limit;
      let result;
      if (limit) {
        result = await watchesCollection
          .find({})
          .sort({ _id: -1 })
          .limit(limit)
          .toArray();
      } else {
        result = await watchesCollection.find({}).toArray();
      }

      res.json(result);
    });

    // add new watch
    app.post("/watches", async (req, res) => {
      const result = await watchesCollection.insertOne(req.body);
      res.send(result);
    });

    //delete item
    app.delete("/watches/:id", async (req, res) => {
      const result = await watchesCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.json(result);
    });

    // get all reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.json(result);
    });

    // get all users
    app.get("/users", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.json(result);
    });

    // get a user
    app.get("/user/:email", async (req, res) => {
      const result = await userCollection.findOne({ email: req.params.email });
      res.json(result);
    });

    // add a review
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // add a order
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // get all order
    app.get("/orders", async (req, res) => {
      // const result = await orderCollection.find({}).toArray();

      const email = req.query.email;
      // console.log(email);

      let result;
      if (email) {
        result = await orderCollection.find({ email: email }).toArray();
      } else {
        result = await orderCollection.find({}).toArray();
      }

      res.json(result);
    });

    // delete order
    app.delete("/order/:id", async (req, res) => {
      const result = await orderCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });

      res.json(result);
    });

    // approve order
    app.put("/order", async (req, res) => {
      const id = req.query.id;
      const order = req.body;

      const updateDoc = {
        $set: { order: order },
      };

      console.log(id);

      const result = await orderCollection.updateOne(
        { _id: ObjectId(id) },
        updateDoc,
        {
          upsert: false,
        }
      );

      res.json(result);
    });

    // add user to db
    app.put("/users", async (req, res) => {
      const userData = req.body;
      const filter = { email: userData.email };
      const options = { upsert: true };
      const updatedUser = {
        $set: { ...userData },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedUser,
        options
      );
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

// default setup
app.get("/", (req, res) => {
  console.log("Watchlaza Server is running on", port);
  res.send("Running Server Watchlaza");
});

// running port
app.listen(port, () => {
  console.log(`Watchlaza is running on http://localhost:${port}/`);
});
