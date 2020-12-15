const config = require('config');
const jwt = require('jsonwebtoken');
// const Joi = require('joi');
const mongoose = require('mongoose');

//simple schema
const StudentSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
    maxlength: 50
  },
  lname: {
    type: String,
    required: true,
    maxlength: 50
  },
  regNumber:{
    type: String,
    required: true,
    maxlength: 50
  },
  fatherName:{
    type: String,
    maxlength: 50
  },
  Department:[
    { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
  ],
  Program:[
    { type: mongoose.Schema.Types.ObjectId, ref: 'Program' }
  ],
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  },
  batch:{
    type:String
  },
  Synopsis: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Synopsis' }
  ],
  status:{
    type:String,
    maxlength:50
  },
  profileImage:{
    type:String
  }
});


//custom method to generate authToken 
StudentSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id, name:this.fname,regNumber:this.regNumber ,email:this.email}, config.get('myprivatekey')); //get the private key from the config file -> environment variable
  return token;
}

const student = mongoose.model('Student', StudentSchema);

//function to validate user 
// function validateUser(user) {
//   const schema = {
//     name: Joi.string().min(3).max(50).required(),
//     email: Joi.string().min(5).max(255).required().email(),
//     password: Joi.string().min(3).max(255).required()
//   };

//   return Joi.validate(user, schema);
// }

exports.Student = student; 
// exports.validate = validateUser;