<?php
/**
 * Plugin Name: Infinity Gallery
 * Plugin URI: https://infinity-gallery.com
 * Description: A high-performance, lazy-loaded gallery plugin for WordPress.
 * Version: 1.11.0
 * Author: Logan Rickert
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Plugin URI: https://github.com/LoganRickert/infinity-gallery
 * Text Domain: infinity-gallery
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit; // Prevent direct access
}

// Define plugin constants
define('INFINITY_GALLERY_VERSION', '1.11.0');
define('INFINITY_GALLERY_DIR', plugin_dir_path(__FILE__));
define('INFINITY_GALLERY_URL', plugin_dir_url(__FILE__));

// Include necessary files
require_once INFINITY_GALLERY_DIR . 'includes/block.php';
require_once INFINITY_GALLERY_DIR . 'includes/enqueue.php';

function infinity_gallery_register_block()
{
    register_block_type(__DIR__, array(
        'render_callback' => 'infinity_gallery_render_callback' // Ensure PHP rendering
    ));
}
add_action('init', 'infinity_gallery_register_block');

// Activation hook
function infinity_gallery_activate() {
    // Future: Any setup logic (e.g., database initialization) can go here.
}
register_activation_hook(__FILE__, 'infinity_gallery_activate');

// Deactivation hook
function infinity_gallery_deactivate() {
    // Cleanup if necessary
}
register_deactivation_hook(__FILE__, 'infinity_gallery_deactivate');

