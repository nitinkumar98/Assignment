const axios = require('axios');
const fs = require('fs');

const downloadVideo = async (s3Url, localFilePath) => {
  try {
    const response = await axios.get(s3Url, { responseType: 'stream' });

    const fileStream = fs.createWriteStream(localFilePath);

    response.data.pipe(fileStream);

    await new Promise((resolve, reject) => {
      fileStream.on('finish', () => {
        console.log('Video download completed.');
        resolve();
      });

      fileStream.on('error', (err) => {
        console.error('Error writing the file:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error downloading the video:', error);
  }
}

module.exports = {
  downloadVideo
}
