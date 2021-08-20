
module.exports = {
  smtpConf: {
    host: 'smtp.googlemail.com', // Gmail Host
    port: 465, // Port
    secure: true, // this is true as port is 465
    auth: {
      user: 'test@gmail.com', // Gmail username
      pass: 'password', // Gmail password
    },
  },
  webURL: 'https://localhost:5100/',
  FE_URL: '',
  FACEBOOK_CLIENT_ID: '883408728914926',
  FACEBOOK_SECRET_ID: '24a53bf5645f856c6c7917746cdfb045',
  FACEBOOK_CALLBACK_URL: 'https://dfefch49ewzyg.cloudfront.net/auth/facebook/callback'
};
