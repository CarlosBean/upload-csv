const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const header = req.header('Authorization');
    const token = header ? header.split(' ')[1] : '';

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'unauthorized access',
                err
            });
        }

        req.user = decoded.user;
        next();
    });
}

const verifyAdminRole = (req, res, next) => {
    const role = req.user.role;

    if (role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            success: false,
            message: 'unauthorized access',
            err: { message: 'access denied due to must be an admin' }
        });
    }

    next();
}

module.exports = {
    verifyToken,
    verifyAdminRole
}