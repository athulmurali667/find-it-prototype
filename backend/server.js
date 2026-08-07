const express = require('express');
const cors = require('cors');
const path = require('path');
const { dbAll, dbGet, dbRun } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from the parent directory (frontend)
app.use(express.static(path.join(__dirname, '..')));

// --- API Routes ---

// Get all posts
app.get('/api/posts', async (req, res) => {
    try {
        const { category, status } = req.query;
        let query = "SELECT * FROM posts WHERE 1=1";
        const params = [];

        if (category && category !== 'all') {
            query += " AND category = ?";
            params.push(category);
        }
        if (status && status !== 'all') {
            query += " AND type = ?"; // frontend uses 'lost' or 'found' for status filter, which maps to 'type' in db
            params.push(status);
        }

        query += " ORDER BY id DESC";

        const posts = await dbAll(query, params);
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Create a new post
app.post('/api/posts', async (req, res) => {
    try {
        const post = req.body;
        // Generate a simple ID
        const id = 'post-' + Date.now();
        
        // Use provided values or defaults
        const title = post.title || 'Untitled Post';
        const type = post.type || 'lost';
        const category = post.category || 'other';
        const location = post.location || 'Unknown';
        const timeAgo = post.timeAgo || 'Just now';
        
        // Simple date formatting YYYY-MM-DD
        const dateObj = new Date();
        const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        
        const image = post.image || 'https://images.unsplash.com/photo-1584824486516-0555a07fc511?auto=format&fit=crop&q=80&w=400';
        const description = post.description || '';
        const reporterName = post.reporterName || 'Anonymous';
        const reporterUsername = post.reporterUsername || 'anonymous';
        const reporterAvatar = post.reporterAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
        const status = 'Active';

        await dbRun(
            `INSERT INTO posts (id, title, type, category, location, timeAgo, date, image, description, reporterName, reporterUsername, reporterAvatar, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, title, type, category, location, timeAgo, date, image, description, reporterName, reporterUsername, reporterAvatar, status]
        );

        res.status(201).json({ success: true, id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Register
app.post('/api/users/register', async (req, res) => {
    try {
        console.log("Register request body:", req.body);
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const finalName = name || email.split('@')[0];
        
        // Generate simple ID and username
        const id = 'user-' + Date.now();
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        
        await dbRun(
            `INSERT INTO users (id, email, password, username, name, bio, avatar, location, isAdmin) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, email, password, username, finalName, '', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', '', 0]
        );
        
        const user = await dbGet("SELECT id, email, username, name, bio, avatar, location, isAdmin FROM users WHERE id = ?", [id]);
        res.status(201).json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed. Email might already exist.' });
    }
});

// Login
app.post('/api/users/login', async (req, res) => {
    try {
        console.log("Login attempt:", req.body);
        const { email, password } = req.body;
        const user = await dbGet("SELECT id, email, username, name, bio, avatar, location, isAdmin FROM users WHERE email = ? AND password = ?", [email, password]);
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get user count (for admin dashboard)
app.get('/api/users/count', async (req, res) => {
    try {
        const row = await dbGet("SELECT COUNT(*) as count FROM users");
        res.json({ count: row.count });
    } catch (err) {
        res.status(500).json({ error: 'Failed to count users' });
    }
});

// Get user profile
app.get('/api/users/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await dbGet("SELECT id, email, username, name, bio, avatar, location, isAdmin FROM users WHERE username = ?", [username]);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
// --- ADMIN ENDPOINTS ---

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await dbAll("SELECT id, email, username, name, bio, avatar, location, isAdmin, status FROM users");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, avatar } = req.body;
        
        let updates = [];
        let params = [];
        
        if (name !== undefined) {
            updates.push("name = ?");
            params.push(name);
        }
        if (avatar !== undefined) {
            updates.push("avatar = ?");
            params.push(avatar);
        }
        
        if (updates.length === 0) return res.json({ success: true });
        
        params.push(id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        
        await dbRun(query, params);
        res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user status
app.put('/api/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await dbRun("UPDATE users SET status = ? WHERE id = ?", [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

// Update post status
app.put('/api/posts/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await dbRun("UPDATE posts SET status = ? WHERE id = ?", [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update post status' });
    }
});

// Get reports
app.get('/api/reports', async (req, res) => {
    try {
        const reports = await dbAll("SELECT * FROM reports ORDER BY date DESC");
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Create report
app.post('/api/reports', async (req, res) => {
    try {
        const { targetId, targetType, reporterId, reason, description } = req.body;
        const id = 'rep-' + Date.now();
        const date = new Date().toISOString();
        await dbRun(
            "INSERT INTO reports (id, targetId, targetType, reporterId, reason, description, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [id, targetId, targetType, reporterId, reason, description, 'Pending', date]
        );
        res.status(201).json({ success: true, id });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create report' });
    }
});

// Update report status
app.put('/api/reports/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await dbRun("UPDATE reports SET status = ? WHERE id = ?", [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update report status' });
    }
});

// Get settings
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await dbAll("SELECT * FROM settings");
        const settingsObj = {};
        settings.forEach(s => settingsObj[s.key] = s.value);
        res.json(settingsObj);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update setting
app.post('/api/settings', async (req, res) => {
    try {
        const { key, value } = req.body;
        await dbRun(
            "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            [key, value]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update setting' });
    }
});

// Fallback to 404.html for unknown routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', '404.html'));
});

// Start Server (only if not running on Vercel)
if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
    app.listen(PORT, () => {
        console.log(`Backend server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
