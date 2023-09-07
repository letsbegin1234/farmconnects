//require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();


  

app.set('view engine','ejs');

app.use('/uploads', express.static('uploads'));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

/*
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
});

const upload = multer({storage:storage});
*/
app.use(session({
    secret: "our farmers project",
    resave: false,
    saveUninitialized: false,
    cookie: {
       maxAge: 7 * 24 * 60 * 60 * 1000 // Set the expiration time in milliseconds (1 week in this example)
    }
   
}));

  
app.use(passport.initialize());
app.use(passport.session());


/*
mongoose.connect("mongodb://localhost:27017/farmersDB",{useNewUrlParser:true}).then(function(err){
  //console.log(err);
  console.log("Connected mongoose");
}); */

//mongoose.connect("mongodb+srv://subhash:subbu143@cluster0.6eumtl4.mongodb.net/todolistDB",{useNewUrlparser : true});
/*
mongoose.connect("mongodb+srv://subhash:subbu143@cluster0.6eumtl4.mongodb.net/searchDB",{
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function(){
  
  console.log("Mongoose connected");
});*/
/*
mongoose.connect("mongodb+srv://andekishore:Kishore-1506@cluster0.szmohag.mongodb.net/farmersDB",{
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function(err){
  
  console.log("Mongoose connected");
});*/
//originaldbbbbb

mongoose.connect("mongodb+srv://kishore:1234@cluster0.w7w19gv.mongodb.net/farmersupdatedDB",{
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function(){
  
  console.log("Mongoose connected");
});

//mongoose.connect("mongodb+srv://andekishore:Kishore-1506@cluster0.szmohag.mongodb.net/?retryWrites=true&w=majority/farmersDB", {useNewUrlParser: true});
//mongoose.set("useCreateIndex", true);
//mongoose.set('bufferCommands',false);
const userSchema = new mongoose.Schema({
  productName:String,
  name:String,
  email:String,
  mobileNum:String,
  url:String,
  quanity:Number
});
const User = new mongoose.model("User",userSchema);
const productSchema = {
    isExists:Boolean,
    farmername:String,
    name:String,
    quantity:String,
    image:{
        name:String,
        data:Buffer,
        contentType:String      
    },
    price:Number,
    mobileNum:String
};
const orderSchema={
  name:String,
  farmerName:String,
  farmerUserName:String,
  productName:String,
  quantity:Number,
  mobileNum:String,
  email:String,
  i:String,
  j:String
}
const farmerSchema = new mongoose.Schema({
    // name:String,
    // username:String,
    // password:String,
    // adress : String,
    // mobile:String,
    // image:{
    //     data:Buffer,
    //     contentType:String,
    //     required:[true,"Please Upload an Image"]
    // },
    // products:[productSchema]
    username:String,
    password:String,
    
    products:[productSchema],
    orders:[orderSchema]
});

farmerSchema.plugin(passportLocalMongoose);
farmerSchema.index({ username: 'text'});

const Farmer = new mongoose.model("Farmer",farmerSchema);
passport.use(Farmer.createStrategy());
passport.serializeUser(Farmer.serializeUser());
passport.deserializeUser(Farmer.deserializeUser());


const upload = multer({dest:'uploads/'});
app.get("/",function(req,res){
  Farmer.find({}).then(function(images){
   // console.log(images[0].products[2].image.data);
    if(images){
     res.render("home",{images:images});
     
    }
   
  });
});

app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});

app.get("/postcrops", function(req, res){
    //res.send("In postcrops route");
   
    if (req.isAuthenticated()){
       
        //console.log("postcrops entered");
        Farmer.find({username:req.user.username}).then(function(images){
         // console.log(images[0].products[2].image.data);
          if(images){
           res.render("postcrops",{images:images});
           //res.render("postcrops");
          }
         
        });
         
        //res.render("postcrops",{images:farmers});
        /* Farmer.find({"products": {$ne: null},"username":req.user.username}, function(err, foundUsers){
            if (err){
              console.log(err);
            } else {
              if (foundUsers) {
                res.render("postcrops", {usersWithSecrets: foundUsers});
              }
            }
          });*/
      
    } else {
      res.redirect("/login");
    }
});


app.get("/newpost",function(req,res){
  if(req.isAuthenticated()){
    res.render("newpost");
  }
  else{
    res.redirect("/login");
  }
});

app.post("/postcrops", upload.single('myImage'),function(req, res){
   // const submittedSecret = req.body.secret;
  /*  const obj = {
        img: {
            data: fs.readFileSync(path.join(__dirname + "/uploads/" + req.file.filename)),
            contentType: "image/png"
        }
    }*/

    const product = {
        isExists:true,
        farmername:req.body.farmername,
        name:req.body.name,
        quantity:req.body.quantity,
        image:{
          name:req.file.originalname,
          data: fs.readFileSync(path.join(__dirname + "/uploads/" + req.file.filename)),
          contentType:req.file.mimetype
        },
        price:req.body.price,
        mobileNum:req.body.mobileNum

    }
  //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
    // console.log(req.user.id);
  
   /* Farmer.findById(req.user.id, function(err, foundUser){
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          foundUser.products = product;
          foundUser.save(function(){
            res.redirect("/postcrops");
          });
        }
      }
    });*/
    Farmer.findOne({username:req.user.username}).then(function(foundUser){
        if(foundUser){
            foundUser.products.push(product);
            foundUser.save();
            res.redirect("/postcrops");
        }
    });

  });

app.post("/register",function(req,res){
    // const obj = {
    //     img: {
    //         data: fs.readFileSync(path.join(__dirname + "/uploads/" + req.file.filename)),
    //         contentType: "image/png"
    //     }
    // }

    // //image upload have an id of myImage

    // const newfarmer = new Farmer({
    //     name:req.body.name,
    //     username:req.body.username,
    //     password:req.body.password,
    //     adress:req.body.adress,
    //     mobile:req.body.mobile,
    //     image:obj.img
    // });

    // newfarmer.save(function(err){
    //     if(err){
    //         console.log(err);
    //     }
    //     else {
    //         res.render("upload");
    //     }
    // });
    //console.log("into the post");
    Farmer.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/postcrops");
          });
        }
    });

});


app.post("/login",function(req,res){
    const user = new Farmer({
        username: req.body.username,
        password: req.body.password
      });
      
      req.login(user, function(err){
        if (err) {
          console.log("incorrect");
          
        } else {
          passport.authenticate("local",{ failureRedirect: '/login', failureMessage: true })(req, res, function(){
            res.redirect("/postcrops");

            
          });
        }
        
      });
});

app.get("/products/:i/product/:j/",function(req,res){
  console.log(req.params.i);
  console.log(req.params.j);
  Farmer.find({}).then(function(images){
    // console.log(images[0].products[2].image.data);
     if(images){
      res.render("product",{images:images,i:req.params.i,j:req.params.j});
      
     }
    
   });
});
app.get("/delete/:i/:j/",function(req,res){
  console.log(req.params.i);
 // var j = (req.params.j);
  Farmer.updateOne(
    { 'username': req.user.username },
    { $set: { [`products.${req.params.j}.isExists`]: 'false' } }
    
  ).then((err, result) => {
      if (err) {
        // Handle error
        console.log("Error");
      } else {
        // Handle success
        console.log("Success")
      }
    });
  res.redirect("/postcrops");
  
});


app.get('/search', (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.status(400).send('Search term is required');
  }

  Farmer.aggregate([
    { $unwind: '$products' },
    { $match: {
      $or: [
          { 'products.farmername': { $regex: searchTerm, $options: 'i' } },
          { 'products.name': { $regex: searchTerm, $options: 'i' } }
        ]
    } },
    { $group: { _id: '$_id', products: { $push: '$products' } } }
  ])
    .then(result => {
      if (result.length === 0) {
        res.render("search404");
      }

      //const posts = result.flatMap(user => user.posts);
     // res.json(posts);
    res.render("searchresults",{images:result,query:searchTerm});
    })
    .catch(err => {
      console.error('Failed to perform search:', err);
      res.status(500).send('Internal Server Error');
    });
});


app.get("/success",function(req,res){
  res.render("success");
});
app.get("/logout", function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });    
});
/*
app.post("/products",function(req,res){
     const newUser = new User({
      name:req.body.name,
      email:req.body.email,
      mobileNum:req.body.mobileNum,
      url:req.originalUrl
     });
     newUser.save().then(function(err){
      res.redirect("success");
     });
});
*/
app.post("/products",function(req,res){
  const order = {
    name:req.body.name,
    farmername:req.body.farmerName,
    farmerUserName:req.body.farmerUserName,
    productName:req.body.productName,
    quantity:req.body.quantity,
    mobileNum:req.body.mobileNum,
    email:req.body.email,
    i:req.body.ivalue,
    j:req.body.jvalue
  }

Farmer.findOne({username:req.body.farmerUserName}).then(function(foundUser){
    if(foundUser){
        foundUser.orders.push(order);
        foundUser.save();
        res.redirect("/success");
    }
});

})




app.listen(3000||process.env.PORT,function(){
    console.log("Server started on port 3000");
});
