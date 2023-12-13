const { MongoClient } = require("mongodb");

async function connectToMongoDB() {
  const uri =
    "mongodb+srv://doadmin:5Q3D1R2e49o7cp6v@fktrnode2023mongodb-07e504fb.mongo.ondigitalocean.com/admin?tls=true&authSource=admin&replicaSet=fktrnode2023mongodb";

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("FktrTest");
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

module.exports = { connectToMongoDB };
