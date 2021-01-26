require("dotenv").config();
const express = require("express");
const captureWebsite = require("capture-website");
const fs = require("fs");
const app = express();
const { v4: uuidv4 } = require("uuid");
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); //Serves resources from public folder
const knex = require("knex")({
  client: process.env.DB_CLIENT,
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

app.listen(process.env.SERVER_PORT);

async function getImages(res, uid) {
  const data = knex("user_table")
    .join("image_table", "user_table.user_id", "=", "image_table.user_id")
    .orderBy("image_table")
    .where({
      user_id: uid,
    })
    .select("image_table.image_link")
    .then((data) => {
      return data;
    });

  res.json(data);
}

async function addImage(req, res, uid) {
    const uuid4 = uuidv4();
    const path = `./public/images/${uid}`
  try {
    //add image to folder
    if (!fs.existsSync(path)) { 
        await fs.mkdir(path, e => { 
            if (e) { 
                throw e;
            }
        });
    }
    await captureWebsite.file(req.body, `public/images/${uid}/${uuid4}.png`);
  } catch (e) {
    console.log("works5 this is e", e);
      res.status(404).send("image could not be added");
      return;
  }
  try {
    //add image information to database
      console.log("works1");
    await knex("image_table").insert({
      user_id: uid,
      image_link: `http://${process.env.DB_HOST}:${process.env.SERVER_PORT}/images/${uid}/${uuid4}.png`,
      //formatting
      image_timezone: new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", " ")
        .replace(/\.(.*)/, ""),
    });
    console.log("works2");
    await res.status(200).send("image uploaded sucessfully");
  } catch (e) {
    fs.unlink(`public/images/${uuid4}.png`, (e) => {
      if (e) {
        console.log(`error with removing`);
      } else {
        console.log(`sucessfully removed ${uuid4}.png`);
      }
    });
    console.log(e);
    res.status(404).send("image could not be added");
  }
  console.log("works4");
}

app.get("/directory", async (req, res) => {
  //getImages(res, "abc");
    console.log('WOOORKS');
    res.sendStatus(200);
});

app.post("/directory", async (req, res) => {
  addImage(req, res, "abc");
});
