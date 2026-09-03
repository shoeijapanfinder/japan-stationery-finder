# Japan Stationery Finder

Static GitHub Pages site for Japan-exclusive, store-exclusive and hard-to-find stationery.

## Files

- `index.html` - page structure
- `style.css` - responsive styling
- `script.js` - filters, search and accordion cards
- `products.json` - curated product data

## GitHub Pages

For a repository named `japanstationeryfinder.github.io` under the `JapanStationeryFinder` organization:

1. Open **Settings**
2. Open **Pages**
3. Under **Build and deployment**, choose **Deploy from a branch**
4. Branch: `main`
5. Folder: `/ (root)`
6. Save

The site should then be available at:

https://japanstationeryfinder.github.io/

## SEO files

- `robots.txt` - allows search crawlers and points to the sitemap
- `sitemap.xml` - declares the canonical homepage
- `favicon.svg` - lightweight site icon
- `og-image.svg` - social sharing preview image
- `index.html` - title, description, canonical URL and Open Graph/Twitter metadata

After deployment, submit `https://japanstationeryfinder.github.io/` in Google Search Console.

## Google Analytics

GA4 measurement ID: `G-6GS0C4JMMF`

Tracked events:
- `filter_select` - filter chip selection
- `product_open` - product card opened
- `official_store_click` - official store link clicked
- `site_search` - search performed after typing pauses
