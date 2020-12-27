const mongoose = require('mongoose');

//simple schema
const ReviewCommentsSchema = new mongoose.Schema({
  
  ReviewTask:{ type: mongoose.Schema.Types.ObjectId, ref: 'ReviewTask' },
  submissionDate:{
    type: Date, default: Date.now 
   },
  
   filepath:{
    type: String,
    maxlength: 550
  },
  
  commenents:{ 
    type: String,
},
status:{
  type:String
}

});



const comments = mongoose.model('Comments', ReviewCommentsSchema);

exports.Comments = comments; 
