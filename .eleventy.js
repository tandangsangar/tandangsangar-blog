module.exports = function (eleventyConfig) {
  // Passthrough Copy
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/_includes/assets");
  eleventyConfig.addPassthroughCopy("src/uploads");

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

  // 3. Filter biar bisa panggil post berdasarkan kategori
  eleventyConfig.addFilter("filterByCategory", function (posts, catName) {
    return posts.filter((p) => p.data.category === catName);
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
