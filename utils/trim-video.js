const ffmpeg = require('fluent-ffmpeg');

const { uploadVideoToYouTube } = require('./upload-video');

const getTrimedVideoAndUploadToYouTube = async (inputFilePath, outputFilePath) => {
  try {
    const command = ffmpeg(inputFilePath);

    command.ffprobe((err, metadata) => {
      if (err) {
        console.error('Error while probing video ::', err);
        throw err;
      }

      console.log('Video duration ::', metadata.format.duration);
      const duration = metadata.format.duration;

      const newDuration = duration / 2;

      command
        .setStartTime(0)
        .setDuration(newDuration)
        .output(outputFilePath)
        .on('end', async () => {
          console.log('Video trimming completed.');
          // Upload video on YouTube
          uploadVideoToYouTube();
        })
        .on('error', (err) => {
          console.error('Error trimming video:', err);
        })
        .run();
      
    });
  } catch (error) {
    console.error('Error while triming video ::', error?.message);
    throw error;
  }
}

module.exports = {
  getTrimedVideoAndUploadToYouTube
}






