const mongoose = require('mongoose');

//simple schema
const SynopsisSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 50
  },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  supervisor:{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  co_supervisor:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }],
  reviewedBy:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }],
  status:{
    type: String,
    required: true,
    maxlength: 50
  },
  filepath:{
    type: String,
    maxlength: 350
  },
  researchField:{
    type: String,
    maxlength: 250
  },
  commenents:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }],
  finalDecision:{
    type: String,
    maxlength: 50
  } 
});

const synopsis = mongoose.model('Synopsis', SynopsisSchema);

exports.Synopsis = synopsis; 
