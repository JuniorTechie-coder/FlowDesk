const {getboardLists, addLists, updateLists, deleteListsId} = require('../controllers/listController');
const { protect } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

//to get all lsit from board id 1
router.get('/board/:id', protect, getboardLists);

//this is the router call to add New lists
router.post('/', protect, addLists);

//thsi is the router call to update/edit the existing lists
router.put('/:id', protect, updateLists);

//thsi is the router call to delete existing Lists
router.delete('/:id', protect, deleteListsId);

module.exports = router;