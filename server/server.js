const express = require('express');
const captureWebsite = require('capture-website');
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); //Serves resources from public folder

app.listen(5000);


async function getImages() { 
   
    const files = await fs.promises.readdir("public/images");
    const images = [];
    files.forEach(file => {
        images.push({ img_src: "http://localhost:5000/images/"+ file });
    });

    return images;
}

app.get('/directory', async(req, res) => {
    let imgs =  await getImages();
    console.log("this is ", imgs);
    res.json(imgs);
});

app.post('/directory', async(req, res) => {

    try {
        (async () => {
            await captureWebsite.file('https://www.artstation.com/?sort_by=trending.html', 'public/images/local-file.png');
        })()
    } catch (e) { 
        res.sendStatus(404);
    }
});