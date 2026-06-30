require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

module.exports = async function() {
    // Jika tidak ada env Supabase, berikan data fallback
    if (!supabaseUrl || !supabaseKey) {
        console.warn("Supabase URL or Key is missing. Using fallback about data.");
        return {
            headline: "TANDANG SANGAR",
            description: "Kolektif multimedia yang bergerak di persimpangan musik, sinema, dan huru-hara kultur pop arus pinggir.",
            social_links: [
                { platform: "INSTAGRAM", url: "https://instagram.com/tandangsangar" },
                { platform: "YOUTUBE", url: "https://youtube.com/tandangsangar" },
                { platform: "TWITTER / X", url: "https://x.com/tandangsangar" }
            ]
        };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('settings').select('*');

    if (error) {
        console.error("Error fetching settings for about.js:", error);
        return {};
    }

    const settings = {};
    data.forEach(item => {
        settings[item.key] = item.value;
    });

    return {
        headline: settings.about_headline || "TANDANG SANGAR",
        description: settings.about_description || "Kolektif multimedia yang bergerak di persimpangan musik, sinema, dan huru-hara kultur pop arus pinggir.",
        social_links: [
            { platform: "INSTAGRAM", url: settings.social_instagram || "https://instagram.com/tandangsangar" },
            { platform: "YOUTUBE", url: settings.social_youtube || "https://youtube.com/tandangsangar" },
            { platform: "TWITTER / X", url: settings.social_twitter || "https://x.com/tandangsangar" }
        ]
    };
};
