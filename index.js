const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

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
			const shop_category = await db
				.collection("shop-category")
				.find()
				.toArray();
			const galary = await db.collection("galary").find().toArray();
			res.send({ galary: galary[0].images, shop_category });
		});

		app.get("/all_toys", async (req, res) => {
			const query = req.query.toy_name;
			if (query) {
				const data = await db
					.collection("all-toys")
					.find({ "toy name": { $regex: query, $options: "i" } })
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
		});

		app.post("/productsByIds", async (req, res) => {
			const ids = req.body;
			const objectIds = ids.map((id) => new ObjectId(id));
			const query = { _id: { $in: objectIds } };
			console.log(ids);
			const result = await productCollection.find(query).toArray();
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("server is running");
});

app.listen(port, () => {
	console.log(`server is running on ${port}`);
});
