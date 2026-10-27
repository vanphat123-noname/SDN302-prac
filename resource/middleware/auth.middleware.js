const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];

        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header is missing' });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ message: 'Token is malformed. Format should be: Bearer <token>' });
        }

        const token = parts[1];
        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }

        const secret = process.env.JWT_SECRET || 'your_secret_key';

        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return res.status(401).json({ 
                    message: 'Token is invalid or expired', 
                    error: err.message 
                });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        return res.status(401).json({ 
            message: 'Authentication failed', 
            error: error.message 
        });
    }
};

module.exports = verifyToken;
