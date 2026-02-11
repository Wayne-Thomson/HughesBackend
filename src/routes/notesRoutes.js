import express from 'express';
import { createANote, getAllNotes, getNote, updateNote, deleteNote } from '../controllers/notesController.js';

const router = express.Router();

// Example with authUser middleware placeholder
// router.get('/', auth, furtherHandlerFunction);

router.get('/', getAllNotes);

router.get('/:id', getNote);

router.post('/', createANote);

router.put('/:id', updateNote);

router.delete('/:id', deleteNote);

export default router;