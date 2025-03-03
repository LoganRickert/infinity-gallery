=== Infinity Gallery ===
Contributors: loganrickert
Tags: gallery, images, responsive, infinite-scroll, lazy-loading
Requires at least: 5.6
Tested up to: 6.7
Stable tag: 1.13.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
Github URI: https://github.com/LoganRickert/infinity-Gallery
Infinity Gallery is a high-performance, lazy-loaded image gallery for WordPress. Supports infinite scrolling and responsive layouts.

== Description ==
Infinity Gallery is a high-performance, lazy-loaded image gallery for WordPress. Supports infinite scrolling and responsive layouts.

== Installation ==
1. Upload the `infinity-gallery` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Insert a gallery block in the editor and select images.

== Changelog ==
= 1.13.0 =

* Changed from Grid to Masonry for gallery.
* Lightbox IDs are now using Media ID to avoid loading wrong image if gallery order changes.

= 1.12.0 =

* Enqueue did not recursively check.

= 1.11.0 =

* Fixed dashicons not being loaded.
* Added extra aria labels.

= 1.10.0 =

* Switched to using blocks.json
* Added ability to customize the forced height of the images
* Added basic caching
* Added Share icons option. Can be configured to share the lightbox URL, the full width image, or the selected image size.
* Added ability to change on image click. You can now have it open a lightbox, open in a new tab, or do nothing.
* Added caption settings. It pulls from the Wordpress Caption field. You can limit the max number of characters if desired and you can customize the font size, text alignment, font color, and background color (including transparency).

= 1.8.0 =
* Removed console logs
* Changed how downloading images worked.

= 1.7.0 =
* Refactored structure

= 1.6.0 =
* Refactored code

= 1.5.0 =
* Fixed touch screen issues with lightbox

= 1.4.0 =
* Ability to add Lightbox Buttons.
* CSS Filters
* Fix bugs

= 1.0.0 =
* Initial release.
