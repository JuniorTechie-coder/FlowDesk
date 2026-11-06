const pool = require('../db');

const getboardLists = async (req, res) => {
    try {
        const boardId = req.params.id;

        // Check whether the user owns the board
        const boardResult = await pool.query(
            `SELECT boards.*
             FROM boards
             JOIN workspaces
             ON boards.workspace_id = workspaces.id
             WHERE boards.id = $1
             AND workspaces.owner_id = $2`,
            [boardId, req.user.user_id]
        );

        if (boardResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Board does not exist or you are not authorized!'
            });
        }

        // Get lists belonging to the authorized board
        const listsResult = await pool.query(
            `SELECT * FROM lists WHERE board_id = $1`,
            [boardId]
        );

        res.status(200).json(listsResult.rows);

    } catch (error) {
        console.error(error);


        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};


//post request to create new lists
const addLists = async (req, res) => {
    try {
        //fetch key for data fetching      
        const { name, position, board_id } = req.body;

        //validation 1 
        if (!name || position === undefined || !board_id) {
            //bad request(missing field) code 400
            return res.status(400).json({ error: 'All fields are required!' });
        }

        // Check whether user owns the board
        const boardResult = await pool.query(
            `SELECT boards.*
             FROM boards
             JOIN workspaces
             ON boards.workspace_id = workspaces.id
             WHERE boards.id = $1
             AND workspaces.owner_id = $2`,
            [board_id, req.user.user_id]
        );

        if (boardResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Board does not exist or you are not authorized!'
            });
        }

        //Hit the Database(Create lists)
        const resultLists = await pool.query('INSERT INTO lists(name, position, board_id) VALUES($1, $2, $3) RETURNING *',
            [name, position, board_id]);

        //now extract newly created  workspaces from array
        const finalLists = resultLists.rows[0];
        res.status(201).json({
            id: finalLists.id,
            name: finalLists.name,
            position: finalLists.position,
            board_id: finalLists.board_id
        });

    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            res.status(500).json({ error: 'list already existed!' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
}

//Logic to update/edit lists
const updateLists = async (req, res) => {
    try {
        // Extract data
        const { name, position } = req.body;
        const id = req.params.id;

        // Validation
        if (!name || position === undefined) {
            return res.status(400).json({
                error: 'all fields are required!'
            });
        }

        // Check whether user owns the list
        const listsResult = await pool.query(
            `SELECT lists.*
    FROM lists
    JOIN boards
    ON lists.board_id = boards.id
    JOIN workspaces
    ON boards.workspace_id = workspaces.id
    WHERE lists.id = $1
    AND workspaces.owner_id = $2`,
    [id, req.user.user_id]
        );

        if (listsResult.rows.length === 0) {
            return res.status(404).json({
                error: 'List does not exist or you are not authorized!'
            })

        }
        // Hit Database( Update list)   
        const updatedLists = await pool.query(
            `UPDATE lists SET  name = $1, position = $2 WHERE id = $3 RETURNING *`,
            [name, position, id]
        );

        // Check result
        if (updatedLists.rows.length === 0) {
            return res.status(404).json({
                error: 'list with this id does not exist!'
            });
        }

        res.status(200).json({
            message: 'List updated successfully!',
            Lists: updatedLists.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'An error occurred on server!'
        });
    }
};

//Logic to delete the boards
const deleteListsId = async (req, res) => {
    try {
        // extract data to update data
        const id = parseInt(req.params.id);

        //Hit Database 
        const deleteLists = await pool.query(`DELETE FROM lists
             WHERE id = $1
             AND board_id IN (
                 SELECT boards.id
                 FROM boards
                 JOIN workspaces
                 ON boards.workspace_id = workspaces.id
                 WHERE workspaces.owner_id = $2
             )
             RETURNING *`,
            [id, req.user.user_id]);

        //Check the result now 
        if (deleteLists.rows.length === 0) {
            res.status(404).json({ error: 'Lists with this id does not exist!' });
        } else {
            res.status(200).json({ message: 'List deleted successfully!' });
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'An Error occured in server!' });
    }
}

module.exports = { getboardLists, addLists, updateLists, deleteListsId };
