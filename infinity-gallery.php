<?php
/**
 * Plugin Name: InfinityGallery
 * Description: A high-performance, lazy-loaded gallery plugin for WordPress.
 * Version: 1.5.0
 * Author: Logan Rickert
 * License: Apache License 2.0
 * License URI: https://www.apache.org/licenses/LICENSE-2.0
 * Text Domain: infinity-gallery
 */

if (!defined('ABSPATH')) {
    exit; // Prevent direct access
}

// Define plugin constants
define('INFINITY_GALLERY_VERSION', '1.5.0');
define('INFINITY_GALLERY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('INFINITY_GALLERY_PLUGIN_URL', plugin_dir_url(__FILE__));

error_log('InfinityGallery block registered');

// Include necessary files
require_once INFINITY_GALLERY_PLUGIN_DIR . 'includes/block.php';
require_once INFINITY_GALLERY_PLUGIN_DIR . 'includes/enqueue.php';

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

