<?php
if (!defined('ABSPATH')) {
    exit;
}

function infinity_gallery_enqueue_assets() {
    if (!has_block('infinity/gallery')) {
        return; // Exit if no InfinityGallery block is on the page
    }

    wp_enqueue_style('infinity-gallery-style', plugins_url('../build/gallery.css?v=2', __FILE__), [], INFINITY_GALLERY_VERSION);
    wp_enqueue_script('infinity-gallery-script', plugins_url('../build/gallery.js', __FILE__), [], INFINITY_GALLERY_VERSION, true);
    wp_enqueue_script('infinity-gallery-lightbox', plugins_url('../build/lightbox.js', __FILE__), [], INFINITY_GALLERY_VERSION, true);
}
add_action('wp_enqueue_scripts', 'infinity_gallery_enqueue_assets');
