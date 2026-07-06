require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

module.exports = async function() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Fallback logic in case environment variables are missing (e.g. locally if .env not loaded)
    if (!supabaseUrl || !supabaseKey) {
        console.warn("WARNING: Missing SUPABASE_URL or SUPABASE_ANON_KEY. Posts will not be fetched.");
        return [];
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Fetch published posts
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*, users(full_name, avatar_url)')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching posts from Supabase:", error);
            return [];
        }

        // Map the data to fit the existing 11ty structure expectations
        // Previously, 11ty used `post.data.title`, `post.url`, etc.
        // We will transform Supabase rows into a similar structure
        return posts.map(post => {
            return {
                url: `/posts/${post.slug}/`,
                date: new Date(post.created_at),
                data: {
                    title: post.title,
                    category: post.category,
                    author: post.users?.full_name || 'Unknown',
                    author_avatar: post.users?.avatar_url || '',
                    image: post.cover_image,
                    excerpt: post.excerpt,
                    tags: ['posts'].concat(post.tags ? post.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : []),
                    custom_tags: post.tags ? post.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : []
                },
                content: post.body // Note: templates might need | safe filter if markdown is already rendered, but we need to render markdown to HTML if it's raw markdown.
            };
        });

    } catch (err) {
        console.error("Critical error in fetching posts:", err);
        return [];
    }
};
