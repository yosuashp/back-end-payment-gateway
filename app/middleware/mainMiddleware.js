const jwt = require('jsonwebtoken');

function authorize(req, res, next) {
    const secretKey = process.env.JWT_SECRET_KEY;
    const hardcodedToken = process.env.TOKEN;
    const token = req.headers['authorization'];
    const xUser = req.headers['x-user'];

    if (!token || !xUser) {
        return res.status(401).json({ error: 'Authorization token and X-USER header are required' });
    }

    const bearerToken = token.split(' ')[1];

    if (bearerToken !== hardcodedToken) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    jwt.verify(bearerToken, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid both token and secretkey' });
        }

        req.user = decoded.data;
        next();
    });
}

module.exports = {
    authorize
}