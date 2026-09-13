const pool = require('../db');
const bcrypt = require('bcrypt');


//this is the logic to get all users
const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT user_id, name, email, profile_image FROM users ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "error occurred in DB" });
    }
};

//this is the logic to get users by their id
const userById = async (req, res) => {
     try {
        const userId = req.params.id;
        const result1 = await pool.query('SELECT user_id, name, email, profile_image FROM users WHERE user_id = $1', [userId]);
        if (result1.rows.length === 0) {
            res.status(404).json({ error: "user not found" });
        } else {
            res.status(200).json(result1.rows[0]);
        }
    } catch (error) {
        console.error("Error fetching user by id:", error);
        res.status(500).json({ error: "error occurred in DB" });
    }
}


//this is the logic to Insert users data  by their id 
const insertUsers = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        //The basic validation to ensure any field is missing or not 
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required!" });
        }
        //Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        //Send the user back if user is created successfully
        const newUsers = await pool.query('INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );
        //Extract newly created user from row array 
        const createdUser = newUsers.rows[0];

        res.status(201).json({
            name: createdUser.name,
            email: createdUser.email
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Email already exists!' });
        }
        console.error("Error inserting user:", error);
        res.status(500).json({ error: 'A server error occurred.' });
    }
}



//this is the logic to Delete users data by their id
const deleteUsers = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        //hit the database 
        const delUser = await pool.query('DELETE FROM users WHERE user_id = $1 Returning *', [id]);

        //now validate to see if anything was deleted
        if (delUser.rows.length === 0) {
            res.status(404).json({ error: 'No user with id existed!' });

        }
        else {
            res.status(200).json({ message: 'user is deleted successfully' })
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An server error occured!' });
    }
}


//this is the logic to update the existing users data
const updateUsers = async (req, res) => {
    try {
        //extract the main objects from object
        const { name, email, password } = req.body;
        const id = req.params.id;
        

        //validate no empty field(edg case)
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Required field is empty!'
            });
        }
        //Hit the Database 
        const userUpdate = await pool.query('UPDATE users SET name = $1, email = $2 WHERE user_id = $3 RETURNING *',
            [name, email, id]);

        //Checking if value already existed or not 
        if (userUpdate.rows.length === 0) {
            res.status(404).json({ error: 'user with this id does not exist' });
        } else {
            res.status(200).json({ message: 'User updated successfully!' });
        }

    } catch (error) {
        res.status(500).json({ error: 'An server error occured!' });
    }
}

module.exports = { getAllUsers, userById, insertUsers, deleteUsers, updateUsers };


