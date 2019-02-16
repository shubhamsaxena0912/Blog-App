var mongoose = require('mongoose');

var Comment = mongoose.model('Comment', {
   text: String,
   creator: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User'
   },
   likes: [
       {
           type: mongoose.Schema.Types.ObjectId,
           ref: "User"
       }
   ]
});