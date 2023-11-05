require('dotenv').config();

async function checkRole (req, res, next) {
    try {
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }

}

module.exports = checkRole;