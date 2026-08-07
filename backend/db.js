const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let dbPath = path.resolve(__dirname, 'database.sqlite');

if (process.env.VERCEL || process.env.VERCEL_ENV) {
    const tmpDbPath = path.join('/tmp', 'database.sqlite');
    try {
        if (!fs.existsSync(tmpDbPath)) {
            if (fs.existsSync(dbPath)) {
                fs.copyFileSync(dbPath, tmpDbPath);
                console.log('Copied SQLite DB to /tmp for Vercel');
            }
        }
        dbPath = tmpDbPath;
    } catch (e) {
        console.error('Error handling SQLite on Vercel', e);
    }
}
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password TEXT,
            username TEXT UNIQUE,
            name TEXT,
            bio TEXT,
            avatar TEXT,
            location TEXT,
            isAdmin INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Active'
        )`);

        // Add status column to existing users if it doesn't exist
        db.run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'Active'`, (err) => {
            // Ignore error if column already exists
        });

        // Posts Table
        db.run(`CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            title TEXT,
            type TEXT,
            category TEXT,
            location TEXT,
            timeAgo TEXT,
            date TEXT,
            image TEXT,
            description TEXT,
            reporterName TEXT,
            reporterUsername TEXT,
            reporterAvatar TEXT,
            status TEXT DEFAULT 'Active'
        )`);

        // Reports Table
        db.run(`CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            targetId TEXT,
            targetType TEXT, 
            reporterId TEXT,
            reason TEXT,
            description TEXT,
            status TEXT DEFAULT 'Pending',
            date TEXT
        )`);

        // Settings Table
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`);


        // Check if we need to seed the users table
        db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
            if (row && row.count === 0) {
                const insertUser = db.prepare(`INSERT INTO users (id, email, password, username, name, bio, avatar, location, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                insertUser.run(
                    'user-1',
                    'admin@findit.com',
                    'password123',
                    'arivera',
                    'Anna Rivera',
                    'Helping items find their way home. Los Angeles based.',
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBqdMji8MRtqjan9uJKN4VsjjGV60LTaJGgVdafL7Xfe-e3j-RqP-o09fSUWIqoJ1qLQkkeUwni-F4RvlYiKiYhWfFJZ3IO1-tgCUXA0A8xh1A97pHDzGw-DsiXOfq5Ws0Ki1qQnW4TCHSpAfF5Z0X_hWAkl9tkVmFrBMpRMv4fj9WevPn01f0fqmw2KSUqOnz9yNdr1ql-yEUz9qaQ2yRy_wrXIrBh3eWmpbLMrbnD9WZ51-ULTExO',
                    'Los Angeles, CA',
                    1
                );
                insertUser.finalize();
                console.log("Seeded initial user.");
            }
        });
        
        // Seed initial posts if empty
        db.get("SELECT COUNT(*) AS count FROM posts", (err, row) => {
            if (row && row.count === 0) {
                const INITIAL_POSTS = [
                    {
                        id: "post-1",
                        title: "Found a Set of Car Keys",
                        type: "found",
                        category: "accessories",
                        location: "Central Park, New York",
                        timeAgo: "Just now",
                        date: "2026-08-04",
                        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhgRjImZoXBTGU2gsDollJqiJATKSDEpIVYQ1-nuQphHfL-Rke7ICVUtx1vA-GPMTNhszusAOcj3dJVUOY-iaEH7U75JdXg-5u_XRUuDSsChHkUGBnPBHGHAc5BXBXdpd2ruQWussQLYflVCHsmxSnV4vn7ahuwGDSCD44vXlWntx_V3pUAzvfGgKZAtAaOrmrDL5lGNihs_Ug8E71epgqutb4FbnUVb12m_ZLQnewQGof_zp38des",
                        description: "Found a set of car keys with a bright yellow woven keychain resting on a clean concrete bench near the main fountain in Central Park. Key fob appears to be for a Toyota.",
                        reporterName: "Anna Rivera",
                        reporterUsername: "arivera",
                        reporterAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqdMji8MRtqjan9uJKN4VsjjGV60LTaJGgVdafL7Xfe-e3j-RqP-o09fSUWIqoJ1qLQkkeUwni-F4RvlYiKiYhWfFJZ3IO1-tgCUXA0A8xh1A97pHDzGw-DsiXOfq5Ws0Ki1qQnW4TCHSpAfF5Z0X_hWAkl9tkVmFrBMpRMv4fj9WevPn01f0fqmw2KSUqOnz9yNdr1ql-yEUz9qaQ2yRy_wrXIrBh3eWmpbLMrbnD9WZ51-ULTExO",
                        status: "Active"
                    },
                    {
                        id: "post-2",
                        title: "Lost Brown Leather Wallet",
                        type: "lost",
                        category: "accessories",
                        location: "Downtown Coffee District",
                        timeAgo: "2 hours ago",
                        date: "2026-08-04",
                        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrTD0IuYVs0k_1iKP9yp4x6BblocW5XMuMqnSseAK0qLiCiXR2Jrj9dQxHZ1BPLpiVIJ3tQ_EDSJYmLCLA6GygnQEVOpAFhXzu35VrJ7lLbylgampRaF9q4z2V84RngPO1VKh0_TpcMsEOX2ZXwTl7VW2xQs39RtsQ7A8k15aY18zFUmHygJ7dFXKLOmq89kobnseTYe4T9GEQOKqfqyR1ziSRD5V8W3j7T0OZcRAQSMZT-6bYu9dX",
                        description: "Dark brown genuine leather bifold wallet. Contains driver's license for Marcus Vance and a couple of credit cards. Left on a outdoor park bench near 5th St.",
                        reporterName: "Marcus Vance",
                        reporterUsername: "marcusv",
                        reporterAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
                        status: "Active"
                    },
                    {
                        id: "post-3",
                        title: "Single Wireless Earbud",
                        type: "found",
                        category: "electronics",
                        location: "Subway Line 4 Station",
                        timeAgo: "5 hours ago",
                        date: "2026-08-04",
                        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFB5PRrJxvuLrN8oPBxxiRpB0MJj0ZFqyiSLmgr9egrwyrl1gxahzFjl3B2jboCGEuere7Nukv6OV2P1iN-7KDIVbaMRFS4iENdo5XhtLyEnIFQYa6YMnAwlFUDUpGAjVf7lUJxwgl6bX_2Q9KQG6lC5qpIvnl7PzSMH3f086uI76iBJm9S50r8bBiHU3x8dCCElB91CN-OjMFrT20Sg9y8Wf_rFhMsAB8llt2DMz94li3KUkKHHHA",
                        description: "Found a right-ear white wireless earbud resting near the ticket gate line. Clean condition with slight wear.",
                        reporterName: "Anna Rivera",
                        reporterUsername: "arivera",
                        reporterAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqdMji8MRtqjan9uJKN4VsjjGV60LTaJGgVdafL7Xfe-e3j-RqP-o09fSUWIqoJ1qLQkkeUwni-F4RvlYiKiYhWfFJZ3IO1-tgCUXA0A8xh1A97pHDzGw-DsiXOfq5Ws0Ki1qQnW4TCHSpAfF5Z0X_hWAkl9tkVmFrBMpRMv4fj9WevPn01f0fqmw2KSUqOnz9yNdr1ql-yEUz9qaQ2yRy_wrXIrBh3eWmpbLMrbnD9WZ51-ULTExO",
                        status: "Active"
                    },
                    {
                        id: "post-4",
                        title: "Lost Black & White Domestic Cat",
                        type: "lost",
                        category: "pets",
                        location: "Maple Avenue & 8th",
                        timeAgo: "1 day ago",
                        date: "2026-08-03",
                        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAnOkYAHtsZyOiImbxZ8yTK8AMw2PGNQPTrhUQiyVPeUUHJ9l37R9BLQQPHp2VkKLDeIKCCotwmQ6xwnraEsx5cbroPedMnrY6SOKLs3cUJ0c1p8PRUc1vpIaQ73ijTuK05S89817E7DQR1q5s0zCqefkuZL7kzgLy_IiJ6yGTXio2RXuD1xukx_Mohd8GjJ3xHlxxibzQGGul0q4kZqzMXMA2yFKO4V4IOEljmlghKv8zzFSKo_Q3",
                        description: "Small black and white cat named Tux. Has a distinctive patch over left eye and wears a red collar with bell. Very friendly but easily startled.",
                        reporterName: "Elena Rostova",
                        reporterUsername: "elena_r",
                        reporterAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
                        status: "Active"
                    }
                ];

                const insertPost = db.prepare(`INSERT INTO posts (id, title, type, category, location, timeAgo, date, image, description, reporterName, reporterUsername, reporterAvatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                
                INITIAL_POSTS.forEach(post => {
                    insertPost.run(post.id, post.title, post.type, post.category, post.location, post.timeAgo, post.date, post.image, post.description, post.reporterName, post.reporterUsername, post.reporterAvatar, post.status);
                });
                
                insertPost.finalize();
                console.log("Seeded initial posts.");
            }
        });
    });
}

// Wrapper for queries to use Promises
const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

module.exports = {
    db,
    dbAll,
    dbGet,
    dbRun
};
