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
                'default' => 4
            ),
            'imageSize' => array(
                'type' => 'string',
                'default' => 'large'
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
    $imageSize = $attributes['imageSize'] ?? 'large';
    $maxPerRow = $attributes['maxPerRow'] ?? 4;

    static $gallery_index = 0;

    // Generate a stable unique ID based on post ID + block position
    $gallery_id = "g" . $gallery_index; // Unique per page & post
    $gallery_index++;

    ob_start();
?>
    <div class="infinity-gallery" id="<?php echo esc_attr($gallery_id); ?>" data-max-per-row="<?php echo esc_attr($maxPerRow); ?>" data-gallery-id="<?php echo esc_attr($gallery_id) ?>">
        <?php foreach ($images as $index => $image) :
            // Ensure correct size selection
            $selectedSrc = isset($image['sizes'][$imageSize]['url']) ? $image['sizes'][$imageSize]['url'] : $image['url'];
            $fullSrc = isset($image['sizes']['full']['url']) ? $image['sizes']['full']['url'] : $image['url'];

            // Unique image ID
            $image_id = "{$gallery_id}-{$index}";
        ?>
            <figure class="infinity-gallery-item">
                <picture>
                    <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" 
                        alt="<?php echo esc_attr($image['alt'] ?? 'Gallery Image'); ?>"
                        class="infinity-gallery-image"
                        loading="lazy"
                        data-id="<?php echo esc_attr($image_id); ?>"
                        data-full="<?php echo esc_url($fullSrc); ?>"
                        data-src="<?php echo esc_url($selectedSrc); ?>"
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
                <img id="lightbox-img" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="Lightbox Image">
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
        document.body.scrollTop = document.documentElement.scrollTop = 0;

        var gallery = document.getElementById("<?php echo esc_js($gallery_id); ?>");
        if (!gallery) return;

        // Read the correct maxPerRow from the data attribute
        var maxPerRow = parseInt(gallery.dataset.maxPerRow) || 4;
        const screenWidth = Math.min(window.innerWidth, 2560); // Limit at 1440p (2560px)

        // Dynamic scaling function
        function calculateColumns() {
            if (screenWidth < 768) return 1; // Always 1 image on mobile

            if (maxPerRow <= 3) {
                if (screenWidth < 1100) return 1; // 1 column under 1300px
                if (screenWidth < 1600 || maxPerRow <= 2) return 2; // 2 columns under 1700px
                return 3; // Otherwise, use 3 columns
            }

            // Scale columns based on screen width and maxPerRow
            return Math.max(1, Math.min(Math.round((screenWidth / 2560) * maxPerRow), maxPerRow));
        }

        var newColumns = calculateColumns();

        // Set columns dynamically on initial load
        gallery.dataset.maxPerRow = maxPerRow;
        gallery.style.display = "grid";
        gallery.style.gridTemplateColumns = `repeat(${newColumns}, 1fr)`;
    })();
</script>
<?php
    return ob_get_clean();
}
