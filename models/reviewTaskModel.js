const mongoose = require('mongoose');

//simple schema
const ReviewTaskSchema = new mongoose.Schema({
  synopsis: { type: mongoose.Schema.Types.ObjectId, ref: 'Synopsis' },
  reviewer:{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  deadline:{
    type: Date,
    required: true,
   },
   assignedDate:{
    type: Date, default: Date.now 
   },
  commenents:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }],
  status:{
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  }
  

});


const reviewtask = mongoose.model('ReviewTask', ReviewTaskSchema);

exports.ReviewTask = reviewtask; 
