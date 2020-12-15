const mongoose = require('mongoose');

//simple schema
const DepatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  programs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
});



const department = mongoose.model('Department', DepatSchema);

exports.Department = department; 
