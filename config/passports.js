
  
const localStrategy = require("passport-local").Strategy;
const facebookStrategy = require("passport-facebook");
const bcrypt = require("bcryptjs");

// Load User Model
const UserModel = require("../models/user");
const config = require('../config/config');

module.exports = passport => {

  
//   passport.use(
//     new localStrategy(
//       {
//         usernameField: "email"
//       },
//       (email, password, done) => {
//         UserModel.findOne({ email }).then(user => {
//           if (!user) {
//             return done(null, false, {
//               message: "That email is not registered"
//             });
//           }

//           // Compare password
//           bcrypt.compare(password, user.password, (err, isFound) => {
//             if (err) throw err;
//             if (isFound) {
//               return done(null, user);
//             } else {
//               return done(null, false, { message: "Your Password incorrect" });
//             }
//           });
//         });
//       }
//     )
//   );

//   passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
//     User.findById(jwtPayload._doc._id, (err, user) => {
//       if (err) {
//         return done(err, false);
//       }
//       if (user) {
//         return done(null, user);
//       } else {
//         return done(null, false);
//       }
//     });
//   }));
  passport.use(
    new facebookStrategy(
      {
        clientID: config.FACEBOOK_CLIENT_ID,
        clientSecret: config.FACEBOOK_SECRET_ID,
        callbackURL: config.FACEBOOK_CALLBACK_URL,
        profileFields: ["emails", "name", "displayName"]
      },
      function(accessToken, refreshToken, profile, done) {
        // const {
        //   _json: { email }
        // } = profile;

        const userData =  {
            email: 'test@gmail.com',
            password: '123456890',
            accountConfirmation: true,
           };

          UserModel.findOne({ email: userData.email }).then(user => {
          if (user) {
            return done(null, user);
          }

          // Hash user password
          const newUser = new User({
            email: userData.email,
            password: userData.password,
            accountConfirmation: userData.accountConfirmation,
          });
          newUser.save().then(user => done(null, user))
        //   bcrypt.genSalt(10, (err, salt) => {
        //     bcrypt.hash(newUser.password, salt, (err, hash) => {
        //       if (err) throw err;
        //       newUser.password = hash;
        //       newUser
        //         .save()
        //         .then(user => {
        //           req.flash("success_alert", "Signin is successful");
        //           res.redirect("/success");
        //         })
        //         .catch(err => console.log(err));
        //       return done(err, user);
        //     });
        //   });
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
      done(err, user);
    });
  });
};