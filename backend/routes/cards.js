const {
    getListsCards,
    getBoardBacklog,
    getCards,
    addCards,
    updateCards,
    assignCard,
    deleteCardsId
} = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

// Get board backlog cards
router.get('/board/:boardId/backlog', protect, getBoardBacklog);

// Get all cards in a specific list
router.get('/lists/:id', protect, getListsCards);

// Get card by id
router.get('/:id', protect, getCards);

// Add new card (standard list card or backlog card)
router.post('/', protect, addCards);

// Assign card to a team member
router.put('/:id/assign', protect, assignCard);

// Update/edit existing card
router.put('/:id', protect, updateCards);

// Delete existing card
router.delete('/:id', protect, deleteCardsId);

module.exports = router;