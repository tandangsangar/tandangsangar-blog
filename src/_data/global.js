require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Default values based on the original global.json
const defaults = {
  "site_title": "TANDANG SANGAR",
  "newsletter_home_btn": "SUBSCRIBE",
  "newsletter_post_btn": "SUBMIT",
  "newsletter_active": false,
  "categories": [
    { "name": "MUSIC", "showInFooter": true },
    { "name": "FILM", "showInFooter": true },
    { "name": "VISUAL", "showInFooter": true },
    { "name": "EVENTS", "showInFooter": true }
  ],
  "nav_toggles": {
    "HOME": true,
    "RADIO": true,
    "ABOUT": true,
    "MUSIC": true,
    "FILM": true,
    "VISUAL": true,
    "EVENTS": true
  },
  "social_links": [
    { "platform": "INSTAGRAM", "url": "https://www.instagram.com/tandangsangar/" },
    { "platform": "TIKTOK", "url": "https://www.tiktok.com/@tandang.sangar" },
    { "platform": "YOUTUBE", "url": "https://www.youtube.com/@TandangSangar" },
    { "platform": "TWITTER (X)", "url": "https://x.com/TandangSangar" },
    { "platform": "Spotify", "url": "https://open.spotify.com/user/312cf35awcovgqt3migvgyklqsnm?si=7-rC5lmWRaKRi0AMiTqb0Q" }
  ],
  "marquee_bottom": "WEDHARAN SANGAR   ⚡   OTOP-SCENE  ⚡   HURU-HARA POP  ⚡    NOKJURNAL HIPSTER  ⚡",
  "newsletter_home_desc": "Dapatkan kabar artikel terbaru Tandang Sangar via email.",
  "manifesto_text": "Ambience suara 24/7 dengan sedikit mainan visual yang bisa dicoba",
  "newsletter_home_url": "#",
  "hero_text_outline": "SANGAR",
  "hero_image": "/uploads/win_20260201_19_32_06_pro.jpg",
  "newsletter_post_url": "#",
  "marquee_top": "NOKJURNAL HIPSTER   ⚡   WEDHARAN SANGAR   ⚡   OTOP-SCENE   ⚡   HURU-HARA POP  ⚡",
  "manifesto_link": "/radio/",
  "newsletter_home_placeholder": "YOUR@EMAIL.COM",
  "manifesto_title": "TS RADIO",
  "newsletter_post_placeholder": "YOUR@EMAIL.COM",
  "hero_sub": "MEDIA ALTERNATIF /// NOISE /// VISUAL /// CULTURE",
  "manifesto_btn": "EXPLORE TS RADIO",
  "newsletter_home_title": "SUBSCRIBE BIAR TETEP GAUL!",
  "hero_text_solid": "TANDANG",
  "newsletter_post_title": "KEEP IT LOUD",
  "newsletter_home_bg": "SUBSCRIBE"
};

module.exports = async function() {
    if (!supabaseUrl || !supabaseKey) {
        return defaults;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('settings').select('*');

    if (error || !data) {
        return defaults;
    }

    const settings = {};
    data.forEach(item => {
        settings[item.key] = item.value;
    });

    return {
        ...defaults,
        hero_text_solid: settings.global_hero_text_solid || defaults.hero_text_solid,
        hero_text_outline: settings.global_hero_text_outline || defaults.hero_text_outline,
        marquee_top: settings.global_marquee_top || defaults.marquee_top,
        marquee_bottom: settings.global_marquee_bottom || defaults.marquee_bottom,
        manifesto_title: settings.global_manifesto_title || defaults.manifesto_title,
        manifesto_text: settings.global_manifesto_text || defaults.manifesto_text,
        manifesto_btn: settings.global_manifesto_btn || defaults.manifesto_btn,
        manifesto_link: settings.global_manifesto_link || defaults.manifesto_link,
        newsletter_home_title: settings.global_newsletter_home_title || defaults.newsletter_home_title,
        newsletter_home_desc: settings.global_newsletter_home_desc || defaults.newsletter_home_desc,
        newsletter_home_placeholder: settings.global_newsletter_home_placeholder || defaults.newsletter_home_placeholder,
        newsletter_home_btn: settings.global_newsletter_home_btn || defaults.newsletter_home_btn,
        newsletter_active: settings.global_newsletter_active !== undefined ? settings.global_newsletter_active === 'true' : defaults.newsletter_active,
        categories: settings.global_categories ? JSON.parse(settings.global_categories) : defaults.categories,
        nav_toggles: settings.global_nav_toggles ? JSON.parse(settings.global_nav_toggles) : defaults.nav_toggles,
        social_links: settings.global_social_links ? JSON.parse(settings.global_social_links) : defaults.social_links
    };
};
