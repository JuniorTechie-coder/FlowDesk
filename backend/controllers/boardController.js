const pool = require('../db');


//Logic to Get all boards in a workspace(by its id)
const getworkspacesboards = async (req, res) => {
    try {
        const workspacesboardId = req.params.id;

        //Hit the database
        const boardsResult = await pool.query('SELECT boards.* FROM boards JOIN workspaces On boards.workspace_id = workspaces.id Where boards.workspace_id = $1 AND workspaces.owner_id = $2',
            [workspacesboardId, req.user.user_id]
        );

        // Check whether workspace belongs to user
        const workspaceResult = await pool.query(
            `SELECT * FROM workspaces
            WHERE id = $1
            AND owner_id = $2`,
            [workspacesboardId, req.user.user_id]
        );

        if(workspaceResult.rows.length === 0){
            return res.status(404).json({
              error: 'Workspace does not exist or you are not authorized!',

            });
        }

        res.status(200).json(boardsResult.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error.message  });
    }
}

//Logic of Open a specific board by ist own id
const getBoards = async (req, res) => {
    try {
        const boardsId = req.params.id;

        //Hit database
        const boardsIdResult = 
        await pool.query('SELECT boards.* FROM boards JOIN workspaces On boards.workspace_id = workspaces.id WHERE boards.id = $1 AND workspaces.owner_id = $2', 
            [boardsId, req.user.user_id]);

        //Validation to check result
        if (boardsIdResult.rows.length === 0) {
            res.status(404).json({ error: 'Board with this id does not exist!' });
        }
        else {
            res.status(200).json(boardsIdResult.rows[0]);
        }

    } catch (error) {
        res.status(500).json({ error: 'error occured in server!' });

    }
}

//Logic to create new boards 
const addBoards = async (req, res) => {
    try {
        //fetch key for data fetching      
        const { name, background, workspace_id } = req.body;

        //validation 1 
        if (!name || !background) {
            //bad request(missing field) code 400
            return res.status(400).json({ error: 'All fields are required!' });
        }


       // Check workspace ownership
             const workspaceResult = await pool.query(
                  'SELECT * FROM workspaces WHERE id = $1 AND owner_id = $2',
            [workspace_id, req.user.user_id]
             );

             if (workspaceResult.rows.length === 0) {
                return res.status(404).json({
                     error: 'Workspace does not exist or you are not authorized!'
            });
        }

       //Hit the Database
        const resultBoards = await pool.query('INSERT INTO boards(name, background, workspace_id) VALUES($1, $2, $3) RETURNING *',
            [name, background, workspace_id]);

        //now extract newly created  workspaces from array
        const finalBoards = resultBoards.rows[0];
        res.status(201).json({
            name: finalBoards.name,
            description: finalBoards.background
        });

    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            res.status(409).json({ error: 'Board already exists!' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
}


//Logic to update/edit boards
const updateBoards = async (req, res) => {
    try {
        const { workspace_id } = req.body;
        const id = req.params.id;

        // Validation
        if (!workspace_id) {
            return res.status(400).json({
                error: 'workspace_id is required!'
            });
        }

        // 1. Check whether the user owns the board
        const boardResult = await pool.query(
            `SELECT boards.*
             FROM boards
             JOIN workspaces
             ON boards.workspace_id = workspaces.id
             WHERE boards.id = $1
             AND workspaces.owner_id = $2`,
            [id, req.user.user_id]
        );

        if (boardResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Board does not exist or you are not authorized!'
            });
        }

        // 2. Check whether the user owns the new workspace
        const workspaceResult = await pool.query(
            `SELECT *
             FROM workspaces
             WHERE id = $1
             AND owner_id = $2`,
            [workspace_id, req.user.user_id]
        );

        if (workspaceResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Workspace does not exist or you are not authorized!'
            });
        }

        // 3. Update the board
        const updatedResult = await pool.query(
            `UPDATE boards
             SET workspace_id = $1
             WHERE id = $2
             RETURNING *`,
            [workspace_id, id]
        );

        res.status(200).json({
            message: 'Board updated successfully!',
            board: updatedResult.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'An error occurred on server!'
        });
    }
};


//Logic to delete the boards
const deleteBoardsId = async (req, res) => {
    try {
        // extract data to update data
        const id = parseInt(req.params.id);

        //Hit Database 
        const deleteBoards = await pool.query('DELETE FROM boards WHERE id = $1 AND workspace_id IN(SELECT id FROM workspaces WHERE owner_id = $2) RETURNING *',
            [id, req.user.user_id]);

        //Check the result now 
        if (deleteBoards.rows.length === 0) {
            res.status(404).json({ error: 'Boards with this id does not exist!' });
        } else {
            res.status(200).json({ message: 'Boards deleted successfully!' });
        }

    } catch (error) {
        res.status(500).json({ error: 'An Error occured in server!' });
    }
}

module.exports = {getworkspacesboards, getBoards, addBoards, updateBoards, deleteBoardsId}



