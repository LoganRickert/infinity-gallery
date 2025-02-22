<?php
if (!defined('ABSPATH')) {
    exit;
}

// Define a fallback version
if (!defined('INFINITY_GALLERY_VERSION')) {
    define('INFINITY_GALLERY_VERSION', '1.0.0');
}

function infinity_gallery_register_block()
{
    // Register the block editor script and style
    wp_register_script(
        'infinity-gallery-editor-script',
        plugins_url('../public/index.js', __FILE__),
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
        INFINITY_GALLERY_VERSION,
        true
    );

    wp_register_style(
        'infinity-gallery-editor-style',
        plugins_url('../public/index.css', __FILE__),
        array(),
        INFINITY_GALLERY_VERSION
    );

    register_block_type('infinity/gallery', array(
        'editor_script'   => 'infinity-gallery-editor-script',
        'editor_style'    => 'infinity-gallery-editor-style',
        'render_callback' => 'infinity_gallery_render_callback',
        'attributes'      => array(
            'images' => array(
                'type'    => 'array',
                'default' => array(),
                'items'   => array(
                    'type'       => 'object',
                    'properties' => array(
                        'id'           => array('type' => 'number'),
                        'url'          => array('type' => 'string'),
                        'alt'          => array('type' => 'string'),
                        'caption'      => array('type' => 'string'),
                        'description'  => array('type' => 'string'),
                        'fullUrl'      => array('type' => 'string'),
                        'thumbnailUrl' => array('type' => 'string'),
                        'sizes'        => array('type' => 'object'),
                    ),
                ),
            ),
            'maxPerRow'       => array('type' => 'number', 'default' => 4),
            'imageSize'       => array('type' => 'string', 'default' => 'large'),
            'gutterSize'      => array('type' => 'number', 'default' => 10),
            'cropImages'      => array('type' => 'boolean', 'default' => false),
            'hideInfo'        => array('type' => 'boolean', 'default' => false),
            'hideDownload'    => array('type' => 'boolean', 'default' => false),
            'filterType'      => array('type' => 'string', 'default' => 'none'),
            'filterStrength'  => array('type' => 'number', 'default' => 100),
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
    $imageSize = sanitize_text_field($attributes['imageSize'] ?? 'large');
    $maxPerRow = intval($attributes['maxPerRow'] ?? 4);
    $gutterSize = intval($attributes['gutterSize'] ?? 10);
    $cropImages = boolval($attributes['cropImages'] ?? false);
    $hideInfo = boolval($attributes['hideInfo'] ?? false);
    $hideDownload = boolval($attributes['hideDownload'] ?? false);
    $filterType = sanitize_text_field($attributes['filterType'] ?? 'none');
    $filterStrength = intval($attributes['filterStrength'] ?? 100);

    static $gallery_index = 0;

    // Generate a stable unique ID based on post ID + block position
    $gallery_id = "g" . $gallery_index; // Unique per page & post
    $gallery_index++;

    ob_start();
?>
    <div class="infinity-gallery" id="<?php echo esc_attr($gallery_id); ?>"
        data-gallery-id="<?php echo esc_attr($gallery_id) ?>"
        data-max-per-row="<?php echo esc_attr($maxPerRow); ?>"
        data-gutter-size="<?php echo esc_attr($gutterSize); ?>"
        data-crop-images="<?php echo esc_attr($cropImages ? 'true' : 'false'); ?>"
        data-hide-info="<?php echo esc_attr($hideInfo ? 'true' : 'false'); ?>"
        data-hide-download="<?php echo esc_attr($hideDownload ? 'true' : 'false'); ?>"
        data-filter-type="<?php echo esc_attr($filterType); ?>"
        data-filter-strength="<?php echo esc_attr($filterStrength); ?>">
        <?php foreach ($images as $index => $image) :
            if (!isset($image['url']) || !wp_http_validate_url($image['url'])) {
                continue; // Skip invalid URLs
            }

            // Ensure correct size selection
            $selectedSrc = !empty($image['sizes'][$imageSize]['url']) ? esc_url($image['sizes'][$imageSize]['url']) : esc_url($image['url']);
            $fullSrc = !empty($image['sizes']['full']['url']) ? esc_url($image['sizes']['full']['url']) : esc_url($image['url']);

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
                        data-filename="<?php echo esc_attr(basename($image['url'])); ?>">
                </picture>
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
            <button id="lightbox-info" aria-label="Image Information">
                <span>ℹ Info</span>
            </button>
            <button id="lightbox-download" aria-label="Download Image">
                <span>⬇ Download</span>
            </button>
        </div>
    </div>
    <script>
        (function() {
            document.body.scrollTop = document.documentElement.scrollTop = 0;

            const gallery = document.getElementById("<?php echo esc_js($gallery_id); ?>");
            if (!gallery) return;

            // Read the correct maxPerRow from the data attribute
            const maxPerRow = parseInt(gallery.dataset.maxPerRow) || 4;
            const gutterSize = parseInt(gallery.dataset.gutterSize) || 10;
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

            const newColumns = calculateColumns();

            // Set columns dynamically on initial load
            gallery.dataset.maxPerRow = maxPerRow;
            gallery.style.display = "grid";
            gallery.style.gridTemplateColumns = `repeat(${newColumns}, 1fr)`;
            gallery.style.gap = `${gutterSize}px`;

            document.querySelectorAll('.infinity-gallery').forEach(gallery => {
                const filterType = gallery.dataset.filterType;
                const filterStrength = gallery.dataset.filterStrength || 100;

                let filterValue = 'none';
                if (filterType !== 'none') {
                    let filterSign = "%";

                    if (filterType === "blur") {
                        filterSign = "px";
                    } else if (filterType === "hue-rotate") {
                        filterSign = "deg";
                    }

                    filterValue = `${filterType}(${filterStrength}${filterSign})`;
                }

                gallery.style.setProperty('--gallery-filter', filterValue);
            });
        })();
    </script>
<?php
    return ob_get_clean();
}
