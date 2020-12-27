const mongoose = require('mongoose');

//simple schema
const NotificationSchema = new mongoose.Schema({
  userid:{ type: mongoose.Schema.Types.ObjectId},
  date:{
      type:Date
  },
  subject:{
      type:String
  },
  status:{
      type:String
  }
});


const notification = mongoose.model('Notification', NotificationSchema);

exports.Notification = notification; 