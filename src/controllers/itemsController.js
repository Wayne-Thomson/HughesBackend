import mongoose from 'mongoose';
import Item from '../models/Item.js';
import ItemImage from '../models/ItemImages.js';
import User from '../models/User.js';
import { authenticateUser } from '../helpers/authHelper.js';

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

/**
 * Retrieves all non-deleted items from the database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON object containing array of items
 */
export const getItems = async (req, res) => {
  try {
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    const items = await Item.find({ isDeleted: false }).sort({ createdAt: -1 });
    if (!items) {
      return res.status(404).json({ message: 'No items found' });
    }
    res.status(200).json({ message: 'Items retrieved successfully', items: items });
  } catch (error) {
    console.error('Error getting items:', error.message);
    handleError(res, error, 'Error getting items');
  }
};

/**
 * Retrieves all soft-deleted items from the database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON object containing array of deleted items
 */
export const getDeletedItems = async (req, res) => {
  try {
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    const items = await Item.find({ isDeleted: true }).sort({ dateDeleted: -1 });
    res.status(200).json({ message: 'Items retrieved successfully', items: items });
  } catch (error) {
    handleError(res, error, 'Error getting deleted items');
  }
};

/**
 * Retrieves a single item by its ID.
 * @param {Object} req - Express request object with item ID in params
 * @param {Object} res - Express response object
 * @returns {Object} JSON object containing the item details
 */
export const getItem = async (req, res) => {
  try {
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item retrieved successfully', item: item });
  } catch (error) {
    handleError(res, error, 'Error getting item');
  }
};

/**
 * Adds a new item to the database.
 * @param {Object} req - Express request object with itemDetails in body
 * @param {Object} res - Express response object
 * @returns {Object} JSON object containing the newly created item
 */
export const addNewItem = async (req, res) => {
  try {
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    const { name, description, weight, estimatedValue } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    // Get user ID from token
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded.userId || decoded.id;
      } catch (e) {
        console.log('Could not decode token for user ID');
      }
    }

    const newItem = new Item({
      name,
      description,
      weight,
      estimatedValue,
      createdBy: userId
    });

    await newItem.save();
    res.status(201).json({ message: 'Item created successfully', item: newItem });
  } catch (error) {
    handleError(res, error, 'Error adding new item');
  }
};

/**
 * Updates an item's custom notes field.
 * @param {Object} req - Express request object with item ID in params and customNotes in body
 * @param {Object} res - Express response object
 * @returns {Object} JSON object containing the updated item
 */
export const updateAnItem = async (req, res) => {
  try {
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    console.log('Received request to update item with ID:', req?.params?.id, 'and body:', req?.body);
    const { id } = req.params;
    const { customNotes } = req.body;
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    item.customNotes = customNotes || item.customNotes;
    await item.save();
    res.status(200).json({ message: 'Item updated successfully', item: item });
  } catch (error) {
    handleError(res, error, 'Error updating item');
  }
};

/**
 * Deletes an item using soft delete (marks as deleted) or hard delete (permanent removal).
 * @param {Object} req - Express request object with item ID in params and hardDelete flag in body
 * @param {Object} res - Express response object
 * @returns {Object} JSON object containing the deleted item
 */
export const deleteAnItem = async (req, res) => {
  try {
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    const { id } = req?.params;
    const { hardDelete } = req?.body;

    let item;
    if (hardDelete) {
      item = await Item.findByIdAndDelete({ _id: id });
      // Delete related item image when hard deleting
      if (item) {
        await ItemImage.deleteOne({ item: id });
      }
    } else {
      item = await Item.findOneAndUpdate(
        { _id: id },
        { isDeleted: true, deletedBy: null, dateDeleted: new Date() },
        { new: true }
      );
      // Delete related item image when soft deleting (disabling)
      if (item) {
        await ItemImage.deleteOne({ item: id });
      }
    }
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted successfully', item: item });
  } catch (error) {
    console.log('Error deleting item:', error);
    handleError(res, error, 'Error deleting item');
  }
};

/**
 * Restores a soft-deleted item, making it visible in the active items list.
 * @param {Object} req - Express request object with item ID in params
 * @param {Object} res - Express response object
 * @returns {Object} JSON object containing the restored item
 */
export const restoreAnItem = async (req, res) => {
  try {
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    const { id } = req.params;
    const item = await Item.findOneAndUpdate(
      { _id: id },
      { isDeleted: false, deletedBy: null, dateDeleted: null },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item restored successfully', item: item });
  } catch (error) {
    handleError(res, error, 'Error restoring item');
  }
};
