//Import packages
const express = require("express");
const mongodb = require("mongodb");
const morgan = require("morgan");
const ejs = require("ejs");
const path = require('path');

//Mongoose:
const mongoose = require('mongoose');
const Parcel = require('./parcel');
const parcel = require("./parcel");

//Configure Express
const app = express();
app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("common"));
app.listen(8080);

//Setup the static assets directories
app.use(express.static('images'));
app.use(express.static('css'));

//Configure MongoDB
const MongoClient = mongodb.MongoClient;

// Connection URL
const url = "mongodb://localhost:27017/fit2095parcels";



//Connect to mongoDB server
mongoose.connect(url, function (err, client) {
  if (err) {
    console.log("Err  ", err);
  }
});


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/addparcel', function (req, res) {
    res.sendFile(path.join(__dirname, '/views/newparcel.html'));
});

app.post('/data', function (req, res) {
    if(req.body.sendername.length < 3 || req.body.senderaddress.length < 3 || req.body.weight < 0){
        res.sendFile(path.join(__dirname, '/views/invaliddata.html'));
    } else {
        let sendername = req.body.sendername;
        let senderaddress = req.body.senderaddress;
        let senderweight = req.body.senderweight;
        let senderfragile = "";
        if (req.body.senderfragile == "yes"){
            senderfragile = "true";
        } else {
            senderfragile = "false";
        }

        var parcel = new Parcel({
            _id: new mongoose.Types.ObjectId(),
            name: sendername, 
            address: senderaddress,
            weight: senderweight,
            fragile: senderfragile,
        });

        parcel.save(function (err) {
            if (err) throw err;
            console.log('Book1 successfully Added to DB');
        });

        res.redirect("/getparcels"); // redirect the client to list parcels page
    }
})

app.get('/getparcels', function (req, res) {
    Parcel
    .find({}, function (err, data) {
        res.render("listparcels", { senderDb: data });
    });
});

app.get('/delparcel', function (req, res) {
  res.sendFile(__dirname + "/views/delparcel.html");
});

//POST request: receive the parcel's name and do the delete operation
app.post("/delete", function (req, res) {
    let parcelDetails = req.body;
    let filter = parcelDetails.id;
    Parcel.findByIdAndDelete(filter, function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            console.log("Deleted : ", docs);
        }
    });
    res.redirect("/getparcels"); // redirect the client to list parcels page
});


//Update parcel:
//GET request: send the page to the client
app.get("/updateparcel", function (req, res) {
    res.sendFile(__dirname + "/views/updateparcel.html");
  });
  
//POST request: receive the details from the client and do the update
app.post("/update", function (req, res) {
    let sendername = req.body.name;
    let senderaddress = req.body.address;
    let senderweight = req.body.weight;
    let senderfragile = "";
    if (req.body.senderfragile == "yes"){
        senderfragile = "true";
    } else {
        senderfragile = "false";
    }
    let filter = req.body.id;

    let theUpdate = {
        $set: {
        name: sendername,
        address: senderaddress,
        weight: senderweight,
        fragile: senderfragile,
        },
    };

    Parcel.findByIdAndUpdate(filter, theUpdate, function (err, doc) {
        console.log(doc);
    });

    res.redirect("/getparcels"); // redirect the client to list users page
});

app.use(function(req,res){
    res.status(404).render('404.html');
});