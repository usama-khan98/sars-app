const mongoose = require('mongoose');

//simple schema
const PresentatioSchema = new mongoose.Schema({
  synopsis: { type: mongoose.Schema.Types.ObjectId, ref: 'Synopsis' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  supervisor:{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  date:{
    type: Date,
    required: true,
   },
   participent1:{
    type:String,
   },
   participent2:{
    type:String,
   },
   participent3:{
    type:String,
   },
   venu:{
    type:String
   },
   timeSlot:{
    type:String
   },
  status:{
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  }
  

});


const presentation = mongoose.model('Presentation', PresentatioSchema);

exports.Presentation = presentation; 
