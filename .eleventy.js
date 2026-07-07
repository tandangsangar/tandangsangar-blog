const marked = require('marked');

module.exports = function (eleventyConfig) {
  // Passthrough Copy
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/_includes/assets");
  eleventyConfig.addPassthroughCopy("src/uploads");
  eleventyConfig.addPassthroughCopy("src/favicon.png");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  // 1. Format Tanggal (biar gak error)
  eleventyConfig.addFilter("date", function (dateVal) {
    return new Date(dateVal).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // 2. Bikin Koleksi Berdasarkan "Category" Frontmatter
  // Ini bikin list otomatis: ["MUSIC", "FILM", "VISUAL"]
  eleventyConfig.addCollection("categories", function (collectionApi) {
    let categories = new Set();
    collectionApi.getAll().forEach((item) => {
      if ("category" in item.data) {
        categories.add(item.data.category);
      }
    });
    return [...categories];
  });

  eleventyConfig.addCollection("allTags", function (collectionApi) {
    let tagSet = new Set();
    collectionApi.getAll().forEach((item) => {
      let tags = (item.data.p && item.data.p.data && item.data.p.data.custom_tags) || item.data.custom_tags;
      if (tags && Array.isArray(tags)) {
        tags.forEach(t => tagSet.add(t));
      }
    });
    return [...tagSet].sort();
  });

  // 3. Filter biar bisa panggil post berdasarkan kategori
  eleventyConfig.addFilter("filterByCategory", function (posts, catName) {
    return posts.filter((p) => p.data.category === catName);
  });

  eleventyConfig.addFilter("filterByTag", function (posts, tagName) {
    return posts.filter((item) => {
      let tags = (item.data.p && item.data.p.data && item.data.p.data.custom_tags) || item.data.custom_tags;
      return tags && Array.isArray(tags) && tags.includes(tagName);
    });
  });

  // 4. Filter Markdown Parser + Custom Brutalist Caption
  eleventyConfig.addFilter("marked", function(content) {
    if (!content) return "";
    let html = marked.parse(content);
    // Ubah *Caption: ...* jadi kotak brutalist
    return html.replace(/<p><em>Caption:\s*(.*?)<\/em><\/p>/gi, '<p class="border-4 border-black p-2 bg-[#ccff00] text-black font-mono text-xs md:text-sm text-center font-bold shadow-[4px_4px_0px_0px_#000000] -mt-6 md:-mt-8 relative z-10 w-11/12 mx-auto uppercase">CAPTION: $1</p>');
  });

  // Browser Sync
  eleventyConfig.setBrowserSyncConfig({
    files: "./_site/css/**/*.css",
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
