<?php
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Remove options/settings if necessary
delete_option('infinity_gallery_options');
