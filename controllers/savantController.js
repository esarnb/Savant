require('dotenv').config();
var path = require("path");
var uuid = require("uuid/v4");
var AWS = require("aws-sdk");
var db = require("../models");

var s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

module.exports = function(app, Sequelize) {
    const Op = Sequelize.Op;
    // Route to Landing Page
    app.get("/", function(req,res){
        res.sendFile(path.join(__dirname, "../public/html/index.html"));
    });

    // Route to Create a Class Page
    app.get("/classes/register", function(req,res) {
        res.sendFile(path.join(__dirname, "../public/html/teacher.html"));
    });

    
    // Route to Create a User Page
    app.get("/users/register", function(req,res) {
        res.sendFile(path.join(__dirname, "../public/html/signUp.html"));
    });
    
    // Route to Create a User Acc
    app.post("/api/users/register", function(req,res) {
        db.User.create({
            name: req.body.name,
            contact: req.body.contact,
            email: req.body.email,
            avatar: req.body.avatar,
            uuid: req.body.uuid,
            classes: req.body.classes
        }).then(function(data) {
            res.json(req.body)
        })
    });


    app.post("/api/image/create", function(req,res) {
        var imageName = req.body.name.toLowerCase();
        imageName = imageName.replace(/\s/g, '');
        imageName = imageName + uuid();

        var newUser = {
            name: req.body.name,
            image: imageName,
        }

        uploadImage(req, newUser.image, function(data){

            res.json(data) //Should have img url now

        });


        function uploadImage(req,image, cb) {
            //raw image data file
            var imageFile = req.files.file.data;
        
            s3.createBucket(function(){
                var params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    ACL:'public-read', 
                    Key: `profile/${image}.jpg`,
                    Body: imageFile 
                }
                s3.upload(params,function(err, data) {
                    if(err) {
                        console.log("error with upload");
                        console.log(err);
                    }
                    console.log("Upload Success");
                    cb(data);
                })
            })
        }
    });
    
    app.get("/api/key", function(req, res) {
      res.json(
        {
          apiKey: process.env.firebase_apiKey,
          authDomain: process.env.firebase_authDomain,
          databaseURL: process.env.firebase_databaseURL,
          projectId: process.env.firebase_projectId,
          storageBucket: process.env.firebase_storageBucket,
          messagingSenderId: process.env.firebase_messagingSenderId,
          appId: process.env.firebase_appId
        }
      )
    })

    // Display All Classes
    app.get("/api/classes", function(req,res) {
        db.Classes.findAll({})
            .then(function(dbClasses){
               
                console.log(dbClasses);
                
                res.json(dbClasses);
            });
    });

    // Search Specific Class
    app.get("/api/classes/find/:title", function(req,res) {
        db.Classes.findAll({
            where: {
                title: {
                    [Op.like]: `%${req.params.title}%`
                }
            }
        })
            .then(function(dbClass){
                console.log("Finished QUery");
                console.log(dbClass);
                
                res.json(dbClass);
            });
        });

    // Display All Users
    app.get("/api/users", function(req,res) {
        db.User.findAll({})
        .then(function(dbUser){
            res.json(dbUser);
        });
    });

    // Search Specific User
    app.get("/api/users/:uuid", function(req,res) {
        db.User.findAll({
            where: {
                uuid: req.params.uuid
            }
        })
            .then(function(dbUser){
                res.json(dbUser);
            });
    });

    // Create a New Class
    app.post("/classes/register", function(req,res) {
        console.log(req.body);
        db.Classes.create({
          title: req.body.title,
          desc: req.body.desc,
          date: req.body.date,
          liveLink: req.body.liveLink,
          teacher: req.body.teacher,
          categ: req.body.categ,
          uuid: uuid()
        })
    });
    
};