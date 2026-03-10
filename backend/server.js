import express from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import Replicate from 'replicate';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(fileUpload());

// Initialize Replicate with your API key from .env
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// Endpoint to upload video
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ error: 'No video uploaded' });
    }

    const videoFile = req.files.video;
    const filePath = `./temp/${videoFile.name}`;
    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
    await videoFile.mv(filePath);

    // Call Replicate AI to change background
    const output = await replicate.run(
      'andreasjansson/green-screen-video:latest',
      {
        input: {
          video: fs.createReadStream(filePath),
          background: 'https://example.com/new-background.jpg'
        }
      }
    );

    res.json({ url: output });
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
