require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const userRoutes = require('./routes/users');
const workspacesRoutes = require('./routes/workspaces');
const boardsRoute = require('./routes/boards');
const listsRoute = require('./routes/lists');
const cardsRoute = require('./routes/cards');
const authRoute = require('./routes/auth');


const app = express();

//MiddleWare
app.use(express.json());
app.use(cors());


//Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});



//Routes
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspacesRoutes);
app.use('/api/boards', boardsRoute);
app.use('/api/lists', listsRoute);
app.use('/api/cards', cardsRoute);
//route for Authentication
app.use('/api/auth', authRoute);


//404 handelers
app.use((req, res) => {
    res.status(404).json('error: Users not found');
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

