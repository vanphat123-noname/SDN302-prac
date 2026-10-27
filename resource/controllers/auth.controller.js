const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const getMembers = () => {
    // Try multiple possible locations for members.json
    const paths = [
        path.join(__dirname, '../members.json'),
        path.join(__dirname, '../../members.json'),
        path.join(process.cwd(), 'members.json')
    ];

    for (const p of paths) {
        if (fs.existsSync(p)) {
            try {
                const data = fs.readFileSync(p, 'utf8');
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) return parsed;
                if (typeof parsed === 'object') return [parsed];
            } catch (e) {
                console.error(`Error reading ${p}:`, e.message);
            }
        }
    }

    // Default fallback if no file found
    return [
        { name: 'storeadmin', pass: 'Store@123' }
    ];
};

exports.issueToken = (req, res) => {
    try {
        const { name, username, pass, password } = req.body;
        const inputName = name || username;
        const inputPass = pass || password;

        if (!inputName || !inputPass) {
            return res.status(401).json({ 
                message: 'Username/name and password/pass are required' 
            });
        }

        const members = getMembers();
        const validMember = members.find(m => {
            const mName = m.name || m.username;
            const mPass = m.pass || m.password;
            return mName === inputName && mPass === inputPass;
        });

        if (!validMember) {
            return res.status(401).json({ 
                message: 'Invalid credentials. Authentication failed.' 
            });
        }

        const secret = process.env.JWT_SECRET || 'your_secret_key';
        const payload = {
            name: validMember.name || validMember.username,
            role: validMember.role || 'storeadmin'
        };

        const token = jwt.sign(payload, secret, { expiresIn: '1d' });

        return res.status(200).json({
            token,
            accessToken: token,
            message: 'Authentication successful',
            user: {
                name: payload.name,
                role: payload.role
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            message: 'Internal server error during authentication',
            error: error.message 
        });
    }
};
