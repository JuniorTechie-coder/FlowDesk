const jwt = require('jsonwebtoken');

//Logic to protect our routes(only logged in users can actually hit api)
const protect = async (req, res, next) => {

    //extract token from request(header)
    const authHeader = req.headers.authorization;

    //If authHeader exists, run split(). Otherwise, give me undefined.
    const token = authHeader?.split(' ')[1]; //split(' ') breaks it into ["Bearer", "eyJhbGci..."] — [1] gets the second part.

    //if no token
    if (!token) {
        return res.status(401).json({ error: 'No token, access denied!' });
    }

    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) throw new Error('JWT_SECRET is not defined in environment');
        const decoded = jwt.verify(token, jwtSecret);//verify token 

        //attach user info to request and call next:
        req.user = decoded;
        next();
    }catch(error){

        console.error(error);
        res.status(401).json({ error: 'Invalid or expired token!' });
    }
    
    
} 

module.exports = { protect };