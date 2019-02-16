var mongoose = require('mongoose');

/*Blog Model*/
var Blog = mongoose.model('Blog', {
    title: String,
    description: String,
    image: String,
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {type: Date, default: Date.now},
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
});

module.exports = Blog;