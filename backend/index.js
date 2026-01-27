const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://FoodBridge:kXy8mF7eUGYVTpTj@cluster0.etgfsk1.mongodb.net/foodbridge?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.log("❌ MongoDB Connection Error:", error);
  }
}

connectDB();
