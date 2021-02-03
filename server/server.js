require("dotenv").config();
const express = require("express");
const captureWebsite = require("capture-website");
const fs = require("fs");
const cors = require("cors");
const app = express();
const { v4: uuidv4 } = require("uuid");
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public")); //Serves resources from public folder

const admin = require("firebase-admin");

const serviceAccount = require("./webmark-3bd3a-firebase-adminsdk-5rkyt-5f5002611f.json");
const { Console } = require("console");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyIdToken = async (idToken) => {
  return await admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      return decodedToken;
      // ...
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
};

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

async function getImages(res, uid, pageNum, total) {
  try {
    const a = await knex("image_table")
      .join("user_table", "image_table.user_id", "=", "user_table.user_id")
      .select("image_table.image_link", "image_table.web_link")
      .where("image_table.user_id", "=", uid)
      .orderBy("image_table.image_timezone", "desc")
      .offset(pageNum * total)
      .limit(total)
      .then((data) => {
        console.log("THE DATA WAS: ", data);
        res.status(200).json(data);
      });
    console.log("a is ", a);
  } catch (e) {
    res.sendStatus(404);
  }
}
async function isUserInDB(decodedToken) {
  try {
    const num = await knex("user_table")
      .where({
        user_id: decodedToken.uid,
      })
      .count("user_id")
      .then((data) => {
        return data[0].count;
      });
    return num > 0 ? true : false;
  } catch (e) {
    console.log("something went wrong with the db check");
    console.log(e);
  }
}

async function addUserToDB(decodedToken) {
  try {
    knex("user_table")
      .insert({
        user_id: decodedToken.uid,
        user_name: decodedToken.name,
        user_email: decodedToken.email,
      })
      .then(() => console.log("added in a new user"));
  } catch (e) {
    console.log(e);
    console.log("COULD NOT ADD NEW USER");
  }
}

async function addImage(req, res, uid) {
  const uuid4 = uuidv4();
  const path = `./public/images/${uid}`;
  try {
    //make directory
    if (!fs.existsSync(path)) {
      await fs.mkdir(path, (e) => {
        if (e) {
          Console.log("something went wrong here");
        }
      });
    }
    //get the image
    const options = {
      width: 1024,
      height: 1024,
      type: "jpeg",
      quality: 0,
      scaleFactor: 1,
      timeout: 10
    };
    await captureWebsite.file(
      req.body,
      `public/images/${uid}/${uuid4}.jpg`,
      options
    );
  } catch (e) {
    console.log(e);
    res.sendStatus(404);
    return;
  }
  try {
    //add image information to database
    const link = `http://${process.env.DB_HOST}:${process.env.SERVER_PORT}/images/${uid}/${uuid4}.jpg`;
    knex("image_table")
      .insert({
        user_id: uid,
        image_link: link,
        //formatting
        web_link: req.body,
        image_timezone: new Date()
          .toISOString()
          .replace("T", " ")
          .replace("Z", " ")
          .replace(/\.(.*)/, ""),
      })
      .then(() => {
        console.log("added image");
        res.status(200).json([{ image_link: link, web_link:req.body }]);
      });
  } catch (e) {
    //delete image from folder incase something fails
    fs.unlink(`public/images/${uuid4}.jpg`, (e) => {
      if (e) {
        console.log(e);
      }
    });
    console.log(e);
    res.status(404).send("image could not be added");
  }
}

app.get("/getImages", async (req, res) => {
  console.log("page num is: ", req.query.page);
  const user = await verifyIdToken(req.get("Authorization"));
  //console.log(user);
  if (user) {
    if (!isUserInDB(user)) addUserToDB(user);
    await getImages(res, user.uid, req.query.page, 10);
  } else {
    res.status(404).send("User is not verified");
  }
});

app.post("/addImage", async (req, res) => {
  const user = await verifyIdToken(req.get("Authorization"));
  if (user) {
    if (!(await isUserInDB(user))) {
      await addUserToDB(user);
    }
    addImage(req, res, user.uid);
  } else {
    res.status(404).send("User is not verified");
  }
});
