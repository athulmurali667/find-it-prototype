/* Data module for Find It Lost & Found */

const INITIAL_PROFILE = {
    username: "arivera",
    name: "Anna Rivera",
    bio: "Helping items find their way home. Los Angeles based.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqdMji8MRtqjan9uJKN4VsjjGV60LTaJGgVdafL7Xfe-e3j-RqP-o09fSUWIqoJ1qLQkkeUwni-F4RvlYiKiYhWfFJZ3IO1-tgCUXA0A8xh1A97pHDzGw-DsiXOfq5Ws0Ki1qQnW4TCHSpAfF5Z0X_hWAkl9tkVmFrBMpRMv4fj9WevPn01f0fqmw2KSUqOnz9yNdr1ql-yEUz9qaQ2yRy_wrXIrBh3eWmpbLMrbnD9WZ51-ULTExO",
    location: "Los Angeles, CA"
};

const INITIAL_POSTS = [
    {
        id: "post-1",
        title: "Found a Set of Car Keys",
        type: "found", // 'found' or 'lost'
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
    },
    {
        id: "post-5",
        title: "Found Reading Glasses",
        type: "found",
        category: "accessories",
        location: "Artisan Bakery & Cafe",
        timeAgo: "1 day ago",
        date: "2026-08-03",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTfgq2y9SE2JtCxTW54pejONcf3ta6f4cLaaS3bEXztapWpsFmsfqPxxaaViFgDKm2Yx-ciejrxwA0r26N1kAK_tMLPmN4rSYtucJj-IlV4MADCKMTuP9ScIF-Q-nZBJgKlSDBNJnfC6i56OB9BXjnaFVneOqR76FB63z00oKdxIuLnqf5-3TTvKR1Yt9ICdXuBldLz7bb2sxk4cAfalpg7GTLsGvVGT9MKejH-Lil_JUeN7Nw6YcB",
        description: "Pair of tortoiseshell frame reading glasses left on a corner table at the bakery. Handed over to cafe cashier for safe keeping.",
        reporterName: "Anna Rivera",
        reporterUsername: "arivera",
        reporterAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqdMji8MRtqjan9uJKN4VsjjGV60LTaJGgVdafL7Xfe-e3j-RqP-o09fSUWIqoJ1qLQkkeUwni-F4RvlYiKiYhWfFJZ3IO1-tgCUXA0A8xh1A97pHDzGw-DsiXOfq5Ws0Ki1qQnW4TCHSpAfF5Z0X_hWAkl9tkVmFrBMpRMv4fj9WevPn01f0fqmw2KSUqOnz9yNdr1ql-yEUz9qaQ2yRy_wrXIrBh3eWmpbLMrbnD9WZ51-ULTExO",
        status: "Active"
    },
    {
        id: "post-6",
        title: "Found Blue Insulated Water Bottle",
        type: "found",
        category: "other",
        location: "Riverside Park Lawn",
        timeAgo: "2 days ago",
        date: "2026-08-02",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyq4oQHRcCIRMuuL2GOBkoBvN2hJerXdY9FYEoC7XXr4qa3ggHCwYTXjTrBsy59Bl-0ZXUTnh2-r1Lab6IhEC6DEJrN3h6K5EvNA16Yx-Vql1eWtAFiunuKHCCgS4d6BZPAnUE85YvhOISXuluK7ulJVXmnGUtKBkNQj_v_ZN5V75Oy4E9t0K2JTyDhAablqQ3_z6NVJAL0ddZitGGZrz6Srz2aRSsdfrgXky0scVJv_wC3WXj4DjL",
        description: "Blue metallic hydro flask water bottle covered in travel stickers. Found resting on the grass near soccer field #2.",
        reporterName: "David Chen",
        reporterUsername: "dchen",
        reporterAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    }
];

const INITIAL_CONVERSATIONS = [];

// Helper functions for LocalStorage management
function getStoredData(key, fallbackValue) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallbackValue;
    } catch (e) {
        console.warn("LocalStorage access issue:", e);
        return fallbackValue;
    }
}

function setStoredData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn("LocalStorage write issue:", e);
    }
}
