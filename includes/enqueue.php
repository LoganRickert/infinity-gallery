<?php
if (!defined('ABSPATH')) {
    exit;
}

// Define a fallback version
if (!defined('INFINITY_GALLERY_VERSION')) {
    define('INFINITY_GALLERY_VERSION', '1.0.0');
}

function infinity_gallery_should_enqueue() {
    global $post;
    if (!$post) {
        return false;
    }

    $blocks = parse_blocks($post->post_content);

    return contains_infinity_gallery_block($blocks);
}

/**
 * Recursively checks if the given blocks contain the 'infinity/gallery' block.
 */
function contains_infinity_gallery_block($blocks) {
    foreach ($blocks as $block) {
        if (isset($block['blockName']) && $block['blockName'] === 'infinity/gallery') {
            return true;
        }

        // Check inside innerBlocks if available
        if (!empty($block['innerBlocks']) && contains_infinity_gallery_block($block['innerBlocks'])) {
            return true;
        }
    }

    return false;
}

function infinity_gallery_enqueue_assets() {
    if (!is_singular() || !infinity_gallery_should_enqueue()) {
        return; // Exit if no Infinity Gallery block is found
    }

    wp_enqueue_style('dashicons');
    wp_enqueue_style('infinity-gallery-style', plugins_url('../public/gallery.css', __FILE__), [], INFINITY_GALLERY_VERSION);
    wp_enqueue_script('infinity-gallery-script', plugins_url('../public/gallery.js', __FILE__), [], INFINITY_GALLERY_VERSION, true);
    wp_enqueue_script('infinity-gallery-lightbox', plugins_url('../public/lightbox.js', __FILE__), [], INFINITY_GALLERY_VERSION, true);
}
add_action('wp_enqueue_scripts', 'infinity_gallery_enqueue_assets');
