<?php
if (!defined('ABSPATH')) {
    exit;
}

function infinity_gallery_register_block()
{
    // Register the block editor script and style
    wp_register_script(
        'infinity-gallery-editor-script',
        plugins_url('../build/index.js?v=1', __FILE__), // Future: This will be the editor JS file
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'), // Dependencies
        INFINITY_GALLERY_VERSION,
        true
    );

    wp_register_style(
        'infinity-gallery-editor-style',
        plugins_url('../build/index.css', __FILE__), // Future: This will be the editor CSS file
        array(),
        INFINITY_GALLERY_VERSION
    );

    register_block_type('infinity/gallery', array(
        'editor_script' => 'infinity-gallery-editor-script',
        'editor_style'  => 'infinity-gallery-editor-style',
        'render_callback' => 'infinity_gallery_render_callback',
        'attributes'      => array(
            'images' => array(
                'type' => 'array',
                'default' => array(),
                'items' => array(
                    'type' => 'object',
                    'properties' => array(
                        'id' => array('type' => 'number'),
                        'url' => array('type' => 'string'),
                        'alt' => array('type' => 'string'),
                        'caption' => array('type' => 'string'),
                        'description' => array('type' => 'string'),
                        'fullUrl' => array('type' => 'string'),
                        'thumbnailUrl' => array('type' => 'string'),
                        'sizes' => array('type' => 'object'),
                    ),
                ),
            ),
            'maxPerRow' => array(
                'type' => 'number',
                'default' => 3
            ),
        ),
    ));
}
add_action('init', 'infinity_gallery_register_block');

function infinity_gallery_render_callback($attributes)
{
    if (empty($attributes['images'])) {
        return '<p>No images selected.</p>';
    }

    $images = $attributes['images'];

    static $gallery_index = 0;

    // Generate a stable unique ID based on post ID + block position
    $gallery_id = "g" . $gallery_index; // Unique per page & post
    $gallery_index++;

    ob_start();
?>
    <div class="infinity-gallery" id="<?php echo esc_attr($gallery_id); ?>" data-max-per-row="4" data-gallery-id="<?php echo esc_attr($gallery_id) ?>">
        <?php foreach ($images as $index => $image) :
            // Ensure correct size selection
            $smallSrc = isset($image['sizes']['medium']['url']) ? $image['sizes']['medium']['url'] : $image['url'];
            $mediumSrc = isset($image['sizes']['large']['url']) ? $image['sizes']['large']['url'] : $image['url'];
            $largeSrc = isset($image['sizes']['1536x1536']['url']) ? $image['sizes']['1536x1536']['url'] : $image['url'];
            $fullSrc = isset($image['sizes']['full']['url']) ? $image['sizes']['full']['url'] : $image['url'];

            // Unique image ID
            $image_id = "{$gallery_id}-{$index}";
        ?>
            <figure class="infinity-gallery-item">
                <picture>
                    <source data-srcset="<?php echo esc_url($largeSrc); ?>" media="(min-width: 1280px)">
                    <source data-srcset="<?php echo esc_url($mediumSrc); ?>" media="(min-width: 768px)">
                    <source data-srcset="<?php echo esc_url($smallSrc); ?>" media="(max-width: 767px)">
                    <img src="data:image/gif;base64" 
                        alt="<?php echo esc_attr($image['alt'] ?? 'Gallery Image'); ?>"
                        class="infinity-gallery-image"
                        loading="lazy"
                        data-id="<?php echo esc_attr($image_id); ?>"
                        data-full="<?php echo esc_url($fullSrc); ?>"
                        data-filename="<?php echo basename($image['url']); ?>">
                </picture>
                <?php if (!empty($image['caption'])) : ?>
                    <figcaption><?php echo esc_html($image['caption']); ?></figcaption>
                <?php endif; ?>
            </figure>
        <?php endforeach; ?>

    </div>
    <div id="lightbox" class="lightbox" role="dialog" aria-labelledby="lightbox-title" aria-hidden="true">
        <!-- Background Overlay for Closing -->
        <div class="lightbox-overlay"></div>

        <!-- Close Button -->
        <button id="lightbox-close" aria-label="Close Lightbox">✕</button>

        <!-- Navigation Buttons -->
        <button id="lightbox-prev" aria-label="Previous Image">‹</button>
        <button id="lightbox-next" aria-label="Next Image">›</button>

        <!-- Lightbox Content -->
        <div class="lightbox-content">
            <div id="lightbox-flip" class="lightbox-flip">
                <img id="lightbox-img" src="/wp-content/plugins/infinity-gallery/assets/loading.gif" alt="Lightbox Image">
                <div id="lightbox-meta" class="lightbox-meta">
                    <p id="meta-info"></p>
                </div>
            </div>
        </div>

        <!-- Bottom Buttons -->
        <div class="lightbox-controls">
            <button id="lightbox-info">
                <span>ℹ Info</span>
            </button>
            <button id="lightbox-download">
                <span>⬇ Download</span>
            </button>
        </div>
    </div>
    <script>
        (function() {
            var gallery = document.getElementById("<?php echo esc_js($gallery_id); ?>");
            if (!gallery) return;

            var newColumns = 1;
            if (window.innerWidth >= 2000) newColumns = 4;
            else if (window.innerWidth >= 1280) newColumns = 3;
            else if (window.innerWidth >= 768) newColumns = 2;

            gallery.dataset.maxPerRow = newColumns;
            gallery.style.display = "grid";
            gallery.style.gridTemplateColumns = "repeat(" + newColumns + ", 1fr)";
        })();
    </script>
<?php
    return ob_get_clean();
}
