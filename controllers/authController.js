const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Logic to Register the new User 
const authRegistration = async (req, res) => {
    try {
        //extract name ,email, password 
        const { name, email, password } = req.body;

        //validation for required field 
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required!' });
        }

        //Hashes the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        //Hit the database 
        const resultRegister = await pool.query('INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING  name, email, user_id',
            [name, email, hashedPassword]
        );

        //now extract newly created  user registration from array(return successful registration)
        const finalRegistration = resultRegister.rows[0];
        res.status(201).json({
            message: 'User registered successfully!',
            user_id: finalRegistration.user_id,
            name: finalRegistration.name,
            email: finalRegistration.email
        });
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }
        res.status(500).json({ error: 'A database error occurred.' });
    }
}

//Logic to Login that new user
const loginUser = async (req, res) => {
    try {
        //extract through main body email   and password
        const { email, password } = req.body;

        //validation
        if (!email || !password) {
             return res.status(400).json({ error: 'All fields are required!' });
        }

        //find user by email by hitting on DB
        const findUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        //check if not found through error 
        if (findUser.rows.length === 0) {
             return res.status(401).json({
                error: 'Invalid credentials!'
            })
        }
        //compare password(isMatch will be true if password is correct)
        const isMatch = await bcrypt.compare(password, findUser.rows[0].password);

        //check password
        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid email or password!'
            });
        }
        const user = findUser.rows[0]; // store it in user variable after the password check

        //  password correct → generate token HERE
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) throw new Error('JWT_SECRET is not defined in environment');
        const token = jwt.sign(
            { user_id: user.user_id, // payload[0]
              email: user.email }, // payload[1]
            jwtSecret,//secret key for signing the token
            { expiresIn: '7d' }
        );
        
        //Login successful 
        res.status(200).json({
            message: 'Login Successful!',
            token,
            user_id: user.user_id,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occured on server!' });
    }
};

module.exports = { authRegistration, loginUser };