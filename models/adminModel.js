const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

//simple schema
const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 50
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
        required: true,
        minlength: 3,
        maxlength: 255
    },
    profileImage:{type:String,required:true},
    isAdmin:Boolean
});


//custom method to generate authToken 
AdminSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id, name:this.name,email:this.email}, config.get('myprivatekey')); //get the private key from the config file -> environment variable
  return token;
}

const admin = mongoose.model('Admin', AdminSchema);

//function to validate user 
// function validateUser(user) {
//   const schema = {
//     name: Joi.string().min(3).max(50).required(),
//     email: Joi.string().min(5).max(255).required().email(),
//     password: Joi.string().min(3).max(255).required()
//   };

//   return Joi.validate(user, schema);
// }

exports.Admin = admin; 
// exports.validate = validateUser;