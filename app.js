
const express = require('express');
const bodyParser = require('body-parser');

const passport = require('passport');
const mongoose = require('mongoose');
const compression = require('compression');
const YoutubeV3Strategy = require('passport-youtube-v3').Strategy
const SamlStrategy = require('passport-saml').Strategy;

var session = require('express-session')
const axios = require('axios');
const https = require('https');
var FacebookStrategy = require('passport-facebook').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;
var request = require("request");
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const db = require('./config/keys').mongoURI;
const config = require('./config/config');

const CronJob = require('cron').CronJob;
const crons = require('./config/crons');
require('dotenv').config();

const UserModel = require("./models/user");

// Instantiate express
const app = express();
app.use(compression());
app.use(cors({ origin: '*' }));
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//   next();
// });
// Passport Config
require('./config/passport')(passport);
app.set('trust proxy', 1);
// sess.cookie.secure = true;
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true, cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());



// DB Config

// Connect to MongoDB
mongoose
  .connect(
    db, {
      useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
  },
  )
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));
  /***
   * CONFIG_CONSTANTS FOR PASSPORT STRATEGIES
   */
  const CONFIG =  {
    FACEBOOK_CLIENT_ID: '883408728914926',
    FACEBOOK_SECRET_ID: '24a53bf5645f856c6c7917746cdfb045',
    FACEBOOK_CALLBACK_URL: 'https://dfefch49ewzyg.cloudfront.net/auth/facebook/callback',
    YOUTUBE_CLIENT_ID: '160899161619-drfan4be3jvoncv47bcsceqndofdlod4.apps.googleusercontent.com',
    YOUTUBE_SECRET_ID: 'BjYGvkQGX6Y-zVhCLj1-y8D5',
    YOUTUBE_CALLBACK_URL: 'https://dfefch49ewzyg.cloudfront.net/auth/youtube/callback',
    INSTAGRAM_CLIENT_ID: '1051846408682845',
    INSTAGRAM_SECRET_ID: '3bbac538bb37f8aa38d916371d47f0c2',
    INSTAGRAM_CALLBACK_URL: 'https://dfefch49ewzyg.cloudfront.net/auth/instagram/callback',
    REDIRECT_SUCCESS_URL: 'https://www.revelecreators.com/admin/icons?success=1',
    REDIRECT_FAILURE_URL: 'https://www.revelecreators.com/admin/icons?success=0',
    INSTAGRAM_TOKEN_API: 'https://api.instagram.com/oauth/access_token',
    SAML_PASS: 'www.google.com',
    SAML_FAIL: 'www.facebook.com',
  }

  /**
   * FACEBOOK PASSPORT 
   */
passport.use(
  new FacebookStrategy(
    {
      clientID: CONFIG.FACEBOOK_CLIENT_ID,
      clientSecret: CONFIG.FACEBOOK_SECRET_ID,
      callbackURL: CONFIG.FACEBOOK_CALLBACK_URL,
      enableProof: true
    },
    function (accessToken, refreshToken, profile, done) {
      console.log("accessToken-facebook", accessToken);

      const userData = {
        accountConfirmation: true,
        provider: 'facebook'
      };

      UserModel.findOne({ accessToken: accessToken }).then(user => {
        if (user) {
          return done(null, user);
        }
        const newUser = {
          accountConfirmation: userData.accountConfirmation,
          provider: userData.provider,
          accessToken: accessToken
        };
        UserModel.create(newUser, function (err, user) {
          if (err) throw err;
          return done(null, user);
        })
      });
      done(null, profile);
    }
  )
);
/**
   * INSTAGRAM PASSPORT 
   */
passport.use(new InstagramStrategy({
  clientID: CONFIG.INSTAGRAM_CLIENT_ID,
  clientSecret: CONFIG.INSTAGRAM_SECRET_ID,
  callbackURL: CONFIG.INSTAGRAM_CALLBACK_URL
},
  function (accessToken, refreshToken, profile, done) {
    console.log('accessToken-instagram', accessToken);
    done(null, profile);
  }
));


passport.use(new SamlStrategy(
  {
    entryPoint: "https://redo2.onmicrosoft.com/a64199e4-a3a7-494e-88ab-3c5dd7d6efe8",
    issuer: "poc",
    callbackUrl: "https://dfefch49ewzyg.cloudfront.net/auth/login/callback",
   // privateKey: fs.readFileSync(path.join(__dirname, "keys/SamlAuthCert_key.key"), "utf-8"),
    cert: "b1473a91-eb8f-442e-b1a5-b83acca4c835",
  },
  function(profile, done) {
    console.log('saml response', profile, done);
    // findByEmail(profile.email, function(err, user) {
      
    //   if (err) {
    //     return done(err);
    //   }
    //   return done(null, user);
    // });
  })
);

/**
   * YOUTUBE PASSPORT 
   */
passport.use(new YoutubeV3Strategy({
  clientID: CONFIG.YOUTUBE_CLIENT_ID,
  clientSecret: CONFIG.YOUTUBE_SECRET_ID,
  callbackURL: CONFIG.YOUTUBE_CALLBACK_URL,
},
  function (accessToken, refreshToken, profile, done) {
    console.log('accessToken-instagram-youtube', accessToken, profile);
    const userData = {
      accountConfirmation: true,
      provider: 'youtube'
    };

    UserModel.findOne({ accessToken: accessToken }).then(user => {
      if (user) {
        return done(null, user);
      }
      const newUser = {
        accountConfirmation: userData.accountConfirmation,
        provider: userData.provider,
        accessToken: accessToken
      };
      UserModel.create(newUser, function (err, user) {
        if (err) throw err;
        return done(null, user);
      })
    });
    done(null, profile);
  }
));


// Express body parser
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// REACT BUILD for production
if (process.env.NODE_ENV === 'PROD') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}


// Initialize routes middleware
app.use('/api/users', require('./routes/users'));
// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at

/**
 *  URLS WHICH HIT FROM BROWSER
 */
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/instagram', passport.authenticate('instagram', { scope: ['user_profile,user_media'] }));

app.get('/auth/youtube', passport.authenticate('youtube'));

app.get('/auth/login/saml',
  passport.authenticate('saml', { failureRedirect: '/saml-fail', failureFlash: true }),
  function(req, res) {
    res.redirect('/saml-pass');
  }
);

app.get('/auth/login/callback',
  passport.authenticate('saml', { failureRedirect: '/saml-fail', failureFlash: true }),
  function(req, res) {
    res.redirect('/saml-pass');
  }
);

passport.serializeUser(function (user, done) {
  console.log('serialize');
  done(null, user);
});

passport.deserializeUser(function (id, done) {
  console.log('deserialize');
  User.findOne({ "id": id }, function (err, user) {
    done(null, err);
  });

});
/**
 *  CALLBACK URLS WHICH HIT FROM BROWSER RESPONSE
 */
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/fail' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/success');
  });
app.get('/auth/youtube/callback',
  passport.authenticate('youtube', { failureRedirect: '/fail' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/success');
  });

  /**
 *  INSTAGRAM PASSPORT API HAS BEEN EXPIRED, SO WE GET THE TOKEN FROM THE API DIRECTLY
 */
app.get('/auth/instagram/callback',
  async (req, res) => {
    var options = {
      method: 'POST',
      url: CONFIG.INSTAGRAM_TOKEN_API,
      headers:
      {
        'content-type': 'application/x-www-form-urlencoded'
      },
      form:
      {
        client_id: CONFIG.INSTAGRAM_CLIENT_ID,
        client_secret: CONFIG.INSTAGRAM_SECRET_ID,
        grant_type: 'authorization_code',
        redirect_uri: CONFIG.INSTAGRAM_CALLBACK_URL,
        code: req.query.code
      }
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      res.redirect(`/get-token?body=${body}`);
    });
  });
app.get('/get-token', (req, res) => {
  const bodyUpdated = req.query.body;

  var options = {
    method: 'GET',
    url: `https://graph.instagram.com/${bodyUpdated.user_id}`,
    qs:
    {
      fields: 'id,username,account_type,media_count',
      access_token: bodyUpdated.access_token
    },
    headers:
    {

      'content-type': 'application/x-www-form-urlencoded'

    },
    form: {}
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    const userData = {
      accountConfirmation: true,
      provider: 'instagram'
    };

    UserModel.findOne({ accessToken: bodyUpdated.access_token }).then(user => {
      if (user) {
        res.redirect('/success');
        // return done(null, user);
      }
      const newUser = {
        accountConfirmation: userData.accountConfirmation,
        provider: userData.provider,
        accessToken: bodyUpdated.access_token
      };
      UserModel.create(newUser, function (err, user) {
        if (err) throw err;
        // return done(null, user);
      })
    });
    res.redirect('/success');
  });
})
app.get("/fail", (req, res) => {
  res.redirect(CONFIG.REDIRECT_FAILURE_URL);
});
app.get("/saml-fail", (req, res) => {
  res.redirect(CONFIG.SAML_FAIL);
});
app.get("/saml-success", (req, res) => {
  res.redirect(CONFIG.SAML_PASS);
});
// run at 3:10 AM -> delete old tokens
const tokensCleanUp = new CronJob('10 3 * * *', function () {
  crons.tokensCleanUp();
});
tokensCleanUp.start();

const PORT = process.env.PORT || 5200;


http.createServer({
}, app)
  .listen(PORT, function () {
    console.log('App listening on port ' + PORT + '! Go to http://localhost:' + PORT + '/');
  });


// FOR HTTPS ONLY
// https.createServer({
//   key: fs.readFileSync(process.env.SSLKEY),
//   cert: fs.readFileSync(process.env.SSLCERT),
// }, app)
//     .listen(PORT, function() {
//       console.log('App listening on port ' + PORT + '! Go to https://localhost:' + PORT + '/');
//     });
// app.use(requireHTTPS); FOR HTTPS
// app.enable('trust proxy');
// app.use(function(req, res, next) {
//   if (req.secure) {
//     return next();
//   }
//   res.redirect('https://' + req.headers.host + req.url);
// });

/**
 * @param {int} req req.
 * @param {int} res res.
 * @param {int} next next.
 * @return {void} none.
 */
function requireHTTPS(req, res, next) {
  if (!req.secure) {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}
