var express = require('express') ,
    mongoose = require('mongoose') ,
    passport = require('passport'),
    passportLocal = require('passport-local'),
    User = require('./models/user'),
    Blog = require('./models/blog'),
    passportLocalMongoose = require('passport-local-mongoose'),
    bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/BlogApp',{useNewUrlParser: true});

app.use(require('express-session')({
    secret: "This is a secret key",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new passportLocal(User.authenticate()));

/* =========================================
   Home Route
   ==========================================*/
app.get('/', function (req,res) {
    res.redirect('/blogs');
});

/* =========================================
   Blog page Routes
   ==========================================*/
app.get('/blogs', function (req,res) {
    Blog.find().populate('creator').exec(function (err,docs) {
       if(err){
           console.log('Something went wrong');
           res.send('Error 404\nPage not found');
       } else {
           res.render('home.ejs', {'blogs': docs, currentUser: req.user});
       }
    });
});

/* =========================================
   Add new blog Routes
   ==========================================*/

app.get('/blogs/new' , function (req,res) {
   res.render('addNew.ejs', {currentUser: req.user});
});

app.post('/created', isLoggedIn, function (req,res) {
    var title = req.body.title;
    var des = req.body.description;
    var image = req.body.image;

    var newBlog = new Blog({
        title: title,
        description: des,
        image: image,
        creator: req.user._id
    });

    newBlog.save(function (err,docs) {
       if(err){
           res.send('Something went wrong');
       } else {

           req.user.blogs.push(docs._id);
           req.user.save(function (err, updatedUser) {
               if (err){
                   console.log(err);
               } else {
                   console.log(updatedUser);
               }
           });
           res.redirect('/blogs');
       }
    });

});

/* =========================================
   Delete Routes
   ==========================================*/
// app.get('/delete/:id' , function (req, res) {
//    var id = req.params.id;
//
//    Blog.findByIdAndRemove(id , function (err, docs) {
//        if (err){
//            res.send('Something went wrong');
//        } else {
//            res.redirect('/blogs');
//        }
//    })
// });

/* =========================================
   Show, edit and Update Routes
   ==========================================*/
app.get('/blogs/:id',function (req,res) {

    var id = req.params.id;
    Blog.findById(id).populate('creator').exec(function (err, foundedBlog) {
        if(err){
            res.redirect('/');
        } else {
            res.render('view.ejs',{'blog': foundedBlog, currentUser: req.user});
        }
    });

});

app.get('/blogs/:id/edit', function (req, res) {

    var id = req.params.id;
    Blog.findById(id, function (err, foundedBlog) {
        if(err){
            res.redirect('/');
        } else {
            res.render('edit.ejs',{'blog': foundedBlog, currentUser: req.user});
        }
    });
});

app.post('/update/:id', function (req, res) {
    var id = req.params.id;

    Blog.findByIdAndUpdate(id, {
        title: req.body.title,
        description: req.body.description,
        image: req.body.image
    }, function (err, updatedBlog) {
       if (err){
           res.redirect('/');
       }  else {
           console.log('Post updated');
           console.log(updatedBlog);
           res.redirect('/');
       }
    });
});

/* =========================================
   Login Routes
   ==========================================*/

app.get('/login', function (req, res) {
       res.render('login.ejs', {currentUser: req.user});
});

app.post('/login', passport.authenticate('local',{
       successRedirect: '/blogs',
       failureRedirect: '/login'
      }) , function (req, res) {

});

/* =========================================
   Register Routes
   ==========================================*/

app.get('/register', function (req, res) {
      res.render('register.ejs', {currentUser: req.user});
});

app.post('/createAccount', function (req, res) {
    User.register({username: req.body.username}, req.body.password , function (err, createdUser) {
        if (err){
            console.log(err);
            res.redirect('/register');
        } else {

            console.log(createdUser);

            createdUser.city = req.body.city;
            createdUser.name = req.body.name;

            createdUser.save(function (err, updatedUser) {
                if (err){
                    console.log(err);
                } else {
                    console.log(updatedUser);
                }
            });

            res.redirect('/login');
        }
    })
});

app.get('/logout', function (req, res) {
   req.logout();
   res.redirect('/');
});

function isLoggedIn(req, res, next){
    if (req.user){
        return next();
    } else {
        res.redirect('/login');
    }
}
/* =======================================
 Get users data
 ========================================
 */

app.get('/users/:id', function (req,res) {
   User.findById(req.params.id, function (err, user) {
       if (err){
           console.log(err);
       } else {
           console.log(user);
           res.send(user.name);
       }
   })
});

app.get('*',function (req, res) {
   res.redirect('/');
});


app.listen(3000, function () {
   console.log('Server is starting');
});