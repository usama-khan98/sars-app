const config = require("config");
const mongoose = require("mongoose");
const body=require('body-parser');
const express = require("express");
// const vvhg=require('./uploads')
const app = express();

//use config module to get the privatekey, if no private key set, end the application
if (!config.get("myprivatekey")) {
  console.error("FATAL ERROR: myprivatekey is not defined.");
  process.exit(1);
}

// http://tutorialtous.com/index.php
// "uri":"mongodb+srv://shehzad:test1234@ssrs-szlsz.mongodb.net/test?retryWrites=true&w=majority"
//  "uri":"mongodb://Shehzad137:test124@localhost:27017/SSRS",
//connect to mongodb
mongoose
  .connect(config.get("uri"), { 
      useUnifiedTopology: true,
      useCreateIndex: true,
      useNewUrlParser: true 
    })
  .then(() => {console.log("Connected to MongoDB...")})
  .catch(err => console.error("Could not connect to MongoDB..."));


app.use(express.json());
app.use(body.json());
app.use(body.urlencoded({extended:false}));
app.use('/uploads', express.static('uploads'));
app.use('/api/admin',require('./routes/Admin'));
app.use('/api/student',require('./routes/Student'));
app.use('/api/faculty',require('./routes/Faculty'));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
