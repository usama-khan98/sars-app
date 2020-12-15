const config = require('config');
const jwt = require('jsonwebtoken');
// const Joi = require('joi');
const mongoose = require('mongoose');

//simple schema
const FacultySchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
    maxlength: 50
  },
  lname: {
    type: String,
    maxlength: 50
  },
  phoneNumber:{
    type: String,
    maxlength: 50
  },
  AreaofInterest:{
    type: String,
    maxlength: 550
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    minlength: 3,
    maxlength: 255
  },
  profileImage:{
    type:String,

  },
  Experience:{
    type: String,
    minlength: 3,
  },
  department:{
    type:String,
    maxlength:225
  },
  assignedTask:[{type: mongoose.Schema.Types.ObjectId, ref: 'ReviewTask'}],
  status:{
    type: String,
    maxlength: 255
  },
  profileLink:{
    type: String,
    maxlength: 255
  },
  performance:{
    type:Number,
  },
  isHecApproved:Boolean,
  isReviewer:Boolean,
  isSupervisor:Boolean
});


//custom method to generate authToken 
FacultySchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id, fname:this.fname,email:this.email }, config.get('myprivatekey')); //get the private key from the config file -> environment variable
  return token;
}

const faculty = mongoose.model('Faculty', FacultySchema);

//function to validate user 
// function validateUser(user) {
//   const schema = {
//     name: Joi.string().min(3).max(50).required(),
//     email: Joi.string().min(5).max(255).required().email(),
//     password: Joi.string().min(3).max(255).required()
//   };

//   return Joi.validate(user, schema);
// }

exports.Faculty = faculty; 
// exports.validate = validateUser;