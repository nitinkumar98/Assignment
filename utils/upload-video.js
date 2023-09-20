const youtube = require('youtube-api');
const opn = require('opn');

const credentials = require('../client_credentials.json');

// Oauth instance
const oauth = youtube.authenticate({
  type: "oauth",
  client_id: credentials.web.client_id,
  client_secret: credentials.web.client_secret,
  redirect_url: credentials.web.redirect_uris[0],
});

const uploadVideoToYouTube = () => {
  console.log('Uploading video to YouTube!');
  opn(oauth.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/youtube.upload"]
  }));
}

module.exports = {
  uploadVideoToYouTube,
  oauth,
}