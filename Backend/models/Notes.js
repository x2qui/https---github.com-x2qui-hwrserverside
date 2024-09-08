const mongoose = require('mongoose');

// Define the schema for the notes
const NoteSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    paths: {
        type: [String], // Array of SVG paths or similar structure
        default: []
    },
    recognizedText: {
        type: String, // Store recognized text from handwriting
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // Add more fields if needed, e.g., userId to associate the note with a specific user
});

// Update the 'updatedAt' field on document save
NoteSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Create and export the model
const Note = mongoose.model('Note', NoteSchema);

module.exports = Note;
