require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Default values based on the original global.json
const defaults = {
  "site_title": "TANDANG SANGAR",
  "newsletter_home_btn": "SUBSCRIBE",
  "newsletter_post_btn": "SUBMIT",
  "social_links": [
    { "platform": "INSTAGRAM", "url": "https://www.instagram.com/tandangsangar/" },
    { "platform": "TIKTOK", "url": "https://www.tiktok.com/@tandang.sangar" },
    { "platform": "YOUTUBE", "url": "https://www.youtube.com/@TandangSangar" },
    { "platform": "TWITTER (X)", "url": "https://x.com/TandangSangar" },
    { "platform": "Spotify", "url": "https://open.spotify.com/user/312cf35awcovgqt3migvgyklqsnm?si=7-rC5lmWRaKRi0AMiTqb0Q" }
  ],
  "marquee_bottom": "WEDHARAN SANGAR   ⚡   OTOP-SCENE  ⚡   HURU-HARA POP  ⚡    NOKJURNAL HIPSTER  ⚡",
  "newsletter_home_desc": "Join the collective. We spam maybe once a week. No corporate bs.",
  "manifesto_text": "MARI BERSAMA MENYAMBUT BULAN RAMADHAN DENGAN TANDANG SYARI'AH",
  "newsletter_home_url": "#",
  "hero_text_outline": "SANGAR",
  "hero_image": "/uploads/win_20260201_19_32_06_pro.jpg",
  "newsletter_post_url": "#",
  "marquee_top": "NOKJURNAL HIPSTER   ⚡   WEDHARAN SANGAR   ⚡   OTOP-SCENE   ⚡   HURU-HARA POP  ⚡",
  "manifesto_link": "https://www.instagram.com/tandangsangar/",
  "newsletter_home_placeholder": "YOUR@EMAIL.COM",
  "manifesto_title": "SEKILAS INFO!",
  "newsletter_post_placeholder": "YOUR@EMAIL.COM",
  "hero_sub": "MEDIA ALTERNATIF /// NOISE /// VISUAL /// CULTURE",
  "manifesto_btn": "TONTON SEKARANG",
  "newsletter_home_title": "DON'T MISS <br/>THE CHAOS",
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
        manifesto_link: settings.global_manifesto_link || defaults.manifesto_link
    };
};
