require('dotenv').config();

const jwt = require('jsonwebtoken');

async function authToken(req, res, next) { 
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        const { id, email, role } = decoded;
    
        req.user = { id, email, role };
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = authToken;