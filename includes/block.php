<?php
if (!defined('ABSPATH')) {
    exit;
}

// Define a fallback version
if (!defined('INFINITY_GALLERY_VERSION')) {
    define('INFINITY_GALLERY_VERSION', '1.0.0');
}

function infinity_gallery_render_callback($attributes)
{
    if (empty($attributes['images'])) {
        return '<p>No images selected.</p>';
    }

    $cache_key = 'infinity_gallery_' . hash('sha256', json_encode($attributes));
    $cached_output = get_transient($cache_key);

    if ($cached_output !== false) {
        return $cached_output;
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

            const containerWidth = gallery.parentElement ? gallery.parentElement.offsetWidth : window.innerWidth;
            const screenWidth = Math.min(containerWidth, 2560);

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
    $output = ob_get_clean();
    
    // Cache output for 1 hour
    set_transient($cache_key, $output, HOUR_IN_SECONDS);

    return $output;
}
