const {getworkspacesboards, getBoards, addBoards, updateBoards, deleteBoardsId} = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

//this is a router call to get all boards in specific workspace
router.get('/workspace/:id', protect, getworkspacesboards);

//this is a router call to get boards by id
router.get('/:id', protect, getBoards);

//this is the router call to add New boards
router.post('/', protect, addBoards);

//thsi is the router call to update/edit the existing boards
router.put('/:id', protect, updateBoards);

//thsi is the router call to delete existing boards
router.delete('/:id', protect, deleteBoardsId);

module.exports = router;
