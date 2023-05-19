const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json(), express.urlencoded({ extended: true }));

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		await client.connect();
		const db = client.db("toy_marketplace");

		// home data process
		app.get("/home", async (req, res) => {
			try {
				const shop_category = await db
					.collection("shop-category")
					.find()
					.toArray();
				const galary = await db.collection("galary").find().toArray();
				res.send({ galary: galary[0].images, shop_category });
			} catch (error) {
				console.log(error);
				res.send(error);
			}
		});

		app.get("/all_toys", async (req, res) => {
			try {
				const query = req.query.toy_name;
				if (query) {
					const data = await db
						.collection("all-toys")
						.find({ toyName: { $regex: query, $options: "i" } })
						.limit(20)
						.toArray();
					res.send(data);
					return;
				}
				const data = await db
					.collection("all-toys")
					.find()
					.limit(20)
					.toArray();
				res.send(data);
			} catch (error) {
				console.log(error);
				res.send(error);
			}
		});
		app.get("/toy/:id", async (req, res) => {
			try {
				const data = await db
					.collection("all-toys")
					.findOne({ _id: new ObjectId(req.params.id.toString()) });
				res.send(data);
			} catch (error) {
				console.log(error);
				res.send(error);
			}
		});

		// add toy
		app.post("/add_toy", async (req, res) => {
			try {
				const insertedData = await db
					.collection("mytoy")
					.insertOne(req.body);
				res.send(insertedData);
			} catch (error) {
				console.log(error);
				res.send(error);
			}
		});
		// update my toy
		app.put("/mytoy", async (req, res) => {
			const { _id, ...rest } = req.body;
			try {
				await db
					.collection("mytoy")
					.updateOne({ _id: new ObjectId(_id) }, { $set: rest });

				const data = await db
					.collection("mytoy")
					.findOne({ _id: new ObjectId(_id) });
				res.send(data);
			} catch (error) {
				console.log(error);
				res.send(error);
			}
		});

		// delete mytoy
		app.delete("/mytoy/:id", async (req, res) => {
			try {
				const deleteItem = await db
					.collection("mytoy")
					.deleteOne({ _id: new ObjectId(req.params.id) });
				res.send(deleteItem);
			} catch (error) {
				console.log(error);
				res.send(error);
			}
		});
		// get my toy
		app.get("/mytoy", async (req, res) => {
			try {
				const mytoys = await db.collection("mytoy").find().toArray();
				res.send(mytoys);
			} catch (error) {
				console.log(error);
				res.send(error);
			}
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log("Successfully connected to MongoDB!");
	} finally {
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("server is running");
});

app.listen(port, () => {
	console.log(`server is running on ${port}`);
});
