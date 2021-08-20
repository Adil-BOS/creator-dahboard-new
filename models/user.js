/* eslint-disable max-len */
/* !

=========================================================
* Argon React NodeJS - v1.0.0
=========================================================

* Product Page: https://argon-dashboard-react-nodejs.creative-tim.com/
* Copyright 2020 Creative Tim (https://https://www.creative-tim.com//)
* Copyright 2020 ProjectData (https://projectdata.dev/)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react-nodejs/blob/main/README.md)

* Coded by Creative Tim & ProjectData

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  accountConfirmation: {
    type: Boolean,
    default: false,
  },
  resetPass: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  provider: {
    type: String,
    default: 'web',
  },
  accessToken: {
    type: String,
    default: '',
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
