import Note from "../models/Note.js";

/**
 * Common error handler for controller responses.
 * @param {Object} res - Express response object.
 * @param {Error} error - The error object.
 * @param {string} message - Custom error message.
 */
const handleError = (res, error, message) => {
  console.error(message, error?.message);
  res.status(500).json({ message, error: error?.message });
};

export const getAllNotes = async (_, res) => {
  try {
    console.log("Fetching all notes from the database.");
    const notes = await Note.find({}).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    handleError(res, error, 'Error retrieving notes');
  }
}

export const getNote = async (req, res) => {
  try {
    console.log("Fetching all notes from the database.");
    const { id } = req.params;
    const note = await Note.findById(id);
    res.status(200).json(note);
  } catch (error) {
    handleError(res, error, 'Error retrieving note');
  }
}


export const createANote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = new Note({ title, content });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    handleError(res, error, 'Error creating note');
  }
}

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(id, { title, content }, { new: true });
    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(updatedNote);
  } catch (error) {
    handleError(res, error, 'Error updating note');
  }
}   

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Error deleting note');
  }
}