const express = require('express');
const tmp = require('tmp');
const path = require('path');
const youtube = require('youtube-api');
const fs = require('fs');

const { downloadVideo } = require('./utils/aws');
const { getTrimedVideoAndUploadToYouTube } = require('./utils/trim-video');
const { oauth } = require('./utils/upload-video');


const app = express();

const port = 3000;
const localFilePath = path.join(tmp.dirSync().name, 'download_video.mp4');
const trimVideoFilePath = path.join(tmp.dirSync().name, 'trim_video.mp4');

app.use(express.json());

app.post('/process-video', async (req, res) => {
  console.log('Req received for ::', req.body);
  const { s3Url } = req.body;
  
  await downloadVideo(s3Url, localFilePath);
  await getTrimedVideoAndUploadToYouTube(localFilePath, trimVideoFilePath);
});

app.get('/oauth2callback', (req, res) => {
  try {
    oauth.getToken(req.query.code, (err, tokens) => {
      if (err) {
          console.log('Error while getting token!');
          throw err;
      }
      console.log("Got the tokens.");
      oauth.setCredentials(tokens);
  
      youtube.videos.insert({
      resource: {
        snippet: {
          title: 'Trimmed Video',
          description: 'This video has been trimmed using my QuickReel.',
        },
        status: {
          privacyStatus: 'unlisted',
        },
      },
      media: {
        body: fs.createReadStream(trimVideoFilePath),
      },
      part: 'snippet,status',
    }, (err, response) => {
      if (err) {
        console.error('Error uploading video:', err);
        throw err;
      }
      console.log(`Video uploaded successfully. Video ID :: ${response.data.id}`);
      res.send({
        success: true,
        videoId: response.data.id,
      });
    });
    });
  } catch (error) {
    console.log('Error while uploading video on YouTube :: ', error);
    throw error;
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})