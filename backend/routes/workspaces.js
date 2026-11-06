const {getAllWorkspaces, getworkspacesId, addWorkspace, updateWorkspaces, deleteWorkspaces} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();


//this is a router call to get all workspaces 
router.get('/', protect, getAllWorkspaces);

//this is a router call to get workspaces by id
router.get('/:id', protect, getworkspacesId);

//this is the router call to add New data
router.post('/', protect, addWorkspace);

//thsi is the router call to update the existing data
router.put('/:id', protect, updateWorkspaces);

//thsi is the router call to delete existing data
router.delete('/:id', protect, deleteWorkspaces);


module.exports = router;
