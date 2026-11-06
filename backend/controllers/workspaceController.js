const pool = require('../db');


//This is the logic to get all workspaces
const getAllWorkspaces = async (req, res) => {
    try {
     //testing the error  
     console.log("USER FROM JWT:", req.user);

        const allWorkspaces = await pool.query(
            'SELECT * FROM workspaces WHERE owner_id = $1', 
            [req.user.user_id]);//this comes from JWT

     //secont test for error
       console.log("WORKSPACES:", allWorkspaces.rows);

        res.status(200).json(allWorkspaces.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error occured in server' });
    }
}


//This is the logic to (GET) workspaces by Id
const getworkspacesId = async (req, res) => {
    try {
        const workspacesId = req.params.id;

        const workspacesResult = await pool.query('SELECT * FROM workspaces WHERE id = $1 AND owner_id = $2', [workspacesId, req.user.user_id]);
        //validation to check data result 
        if (workspacesResult.rows.length == 0) {
            return res.status(404).json({ message: 'Data not found!' });
        }
        else {
            //send response
            res.status(200).json(workspacesResult.rows[0]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'error occured in server!' });
    }
}


//This is the Logic to Add(create)(POST) new Workspace
const addWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                error: "All fields are required!"
            });
        }

        const result = await pool.query(
            `INSERT INTO workspaces(name, description, owner_id)
             VALUES($1, $2, $3)
             RETURNING *`,
            [name, description, req.user.user_id]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Server error"
        });
    }
};


//logic to update/edit(PUT) existing data
const updateWorkspaces = async (req, res) => {
    try {
        // extract data to update data
        const { name, description } = req.body;
        const id = req.params.id;

        //Vlidation 
        if (!name || !description) {
            //Bad request(missing field 400 status code)
            return res.status(400).json({ error: 'Not found!' }); // add return
        }

        //Hit Database 
        const updatedData = await pool.query('UPDATE workspaces SET name = $1, description = $2 WHERE id = $3 AND owner_id = $4 RETURNING *',
            [name, description, id, req.user.user_id]);

        //Check the result now 
        if (updatedData.rows.length === 0) {
            res.status(404).json({ error: 'workspace with this id does not exist!' });
        } else {
            res.status(200).json(updatedData.rows[0]);
        }

    } catch (error) {
        res.status(500).json({ error: 'An Error occured in server!' });
    }
}

//This is the logic to Delete the workspaces
const deleteWorkspaces = async (req, res) => {
    try {
        // extract data to update data
        const id = parseInt(req.params.id);

        //Hit Database 
        const deleteData = await pool.query('DELETE FROM workspaces WHERE id = $1 AND owner_id = $2 RETURNING *',
            [id, req.user.user_id]);

        //Check the result now 
        if (deleteData.rows.length === 0) {
            res.status(404).json({ error: 'workspace with this id does not exist!' });
        } else {
            res.status(200).json({ message: 'workspace deleted successfully!' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An Error occured in server!' });
    }
}

module.exports = { getAllWorkspaces, getworkspacesId, addWorkspace, updateWorkspaces, deleteWorkspaces };
