const mongoose = require('mongoose');

//simple schema
const Progranmschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  AreaOfSpecilization: {
    type: String,
    required: true,
    maxlength: 50
  },
});



const program = mongoose.model('Program', Progranmschema);

exports.Program = program; 
