var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

/*User Model*/
var userSchema = new mongoose.Schema({
    userName: String,
    password: String,
    name: String,
    city: String,
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);