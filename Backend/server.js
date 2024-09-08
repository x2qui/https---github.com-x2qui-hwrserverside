const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Note = require('./models/Notes'); // Import the Note model

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Connect to MongoDB
mongoose.connect('mongodb://localhost:***/hwrdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("DB CONNECTED");
})
.catch((err) => {
    console.error("UNABLE TO CONNECT TO DB:", err);
});

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Endpoint to create a new note
app.post('/notes', async (req, res) => {
  const { subject } = req.body;
  try {
    const newNote = new Note({
      subject,
      paths: [] 
    });
    await newNote.save();
    res.status(201).send(newNote);
  } catch (error) {
    res.status(500).send('Error creating note');
  }
});

// Endpoint to get all notes
app.get('/notes', async (req, res) => {
  try {
    const notes = await Note.find();
    res.status(200).send(notes);
  } catch (error) {
    res.status(500).send('Error fetching notes');
  }
});

// Endpoint to get a specific note by ID
app.get('/notes/:noteId', async (req, res) => {
    const { noteId } = req.params;
  
    try {
      const note = await Note.findById(noteId);
      if (note) {
        res.status(200).send(note);
      } else {
        res.status(404).send('Note not found');
      }
    } catch (error) {
      res.status(500).send('Error fetching note');
    }
});

app.post('/recognize', upload.single('file'), async (req, res) => {
  try {
    const { noteId } = req.body; // Assume the noteId is sent along with the image
    const formData = new FormData();
    formData.append('file', req.file.buffer, 'image.png');

    const response = await axios.post('http://localhost:5000/predict', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    const recognizedText = response.data.text;

    // Update the note with recognized text
    const note = await Note.findById(noteId);
    if (note) {
      note.recognizedText = recognizedText;
      await note.save();
      res.status(200).json({ message: 'Text recognized and saved', recognizedText });
    } else {
      res.status(404).send('Note not found');
    }

  } catch (error) {
    console.error('Error recognizing handwriting:', error);
    res.status(500).send('Error recognizing handwriting');
  }
});


// Endpoint to save paths to a specific note
app.post('/notes/:noteId/savePaths', async (req, res) => {
  const { noteId } = req.params;
  const { paths } = req.body;
  console.log('Received noteId:', noteId); // Log the received noteId
  console.log('Received paths:', paths); // Log the received paths

  try {
      const note = await Note.findById(noteId);
      if (note) {
          note.paths = paths; // Update with new paths
          await note.save();
          res.status(200).send(note);
      } else {
          res.status(404).send('Note not found');
      }
  } catch (error) {
      console.error('Mongoose error saving paths:', error);
      res.status(500).send('Error saving paths');
  }
});

// Endpoint to clear paths from a specific note
app.post('/notes/:noteId/clearPaths', async (req, res) => {
  const { noteId } = req.params;

  try {
      const note = await Note.findById(noteId);
      if (note) {
          note.paths = []; // Clear paths
          await note.save();
          res.status(200).send(note);
      } else {
          res.status(404).send('Note not found');
      }
  } catch (error) {
      console.error('Error clearing paths:', error);
      res.status(500).send('Error clearing paths');
  }
});



// Endpoint to delete a specific note
app.delete('/notes/:noteId', async (req, res) => {
  const { noteId } = req.params;

  try {
    const result = await Note.findByIdAndDelete(noteId);
    if (result) {
      res.status(200).send('Note deleted successfully');
    } else {
      res.status(404).send('Note not found');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).send('Error deleting note');
  }
});



mongoose.set('debug', true);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

