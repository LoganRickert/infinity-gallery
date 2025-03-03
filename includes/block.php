<?php
if (!defined('ABSPATH')) {
    exit;
}

// Define a fallback version
if (!defined('INFINITY_GALLERY_VERSION')) {
    define('INFINITY_GALLERY_VERSION', '1.0.0');
}

/**
 * Sanitize a hex color, supporting alpha transparency.
 */
function infinity_gallery_sanitize_hex_color_with_alpha($color)
{
    if (preg_match('/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/', $color)) {
        return $color;
    }
    return '';
}

function infinity_gallery_render_callback($attributes)
{
    if (empty($attributes['images'])) {
        return '<p aria-live="polite">No images selected.</p>';
    }

    $disableCaching = !empty($attributes['disableCaching']) ? boolval($attributes['disableCaching']) : false;

    if (!$disableCaching) {
        $cache_key = 'infinity_gallery_' . hash('sha256', json_encode($attributes));
        $cached_output = get_transient($cache_key);

        if ($cached_output !== false) {
            return $cached_output;
        }
    }

    $gallery_uid = uniqid();

    $images = $attributes['images'];
    $imageSize = sanitize_text_field($attributes['imageSize'] ?? 'large');
    $maxPerRow = intval($attributes['maxPerRow'] ?? 4);
    $padding = intval($attributes['padding'] ?? 20);
    $gutterSize = intval($attributes['gutterSize'] ?? 10);
    $cropImages = boolval($attributes['cropImages'] ?? false);
    $cropImageHeight = intval($attributes['cropImageHeight'] ?? 250);
    $hideInfo = boolval($attributes['hideInfo'] ?? false);
    $hideDownload = boolval($attributes['hideDownload'] ?? false);
    $filterType = sanitize_text_field($attributes['filterType'] ?? 'none');
    $filterStrength = intval($attributes['filterStrength'] ?? 100);
    $galleryKey = sanitize_title($attributes['galleryKey'] ?? 'gallery');

    $captionPosition = sanitize_text_field($attributes['captionPosition'] ?? 'None');
    $captionFontSize = intval($attributes['captionFontSize'] ?? 16);
    $captionFontColor = infinity_gallery_sanitize_hex_color_with_alpha($attributes['captionFontColor'] ?? '#000000');
    $captionBackgroundColor = infinity_gallery_sanitize_hex_color_with_alpha($attributes['captionBackgroundColor'] ?? '#ffffff');
    $limitCaptionCharacters = boolval($attributes['limitCaptionCharacters'] ?? false);
    $captionCharacterLimit = intval($attributes['captionCharacterLimit'] ?? 100);
    $captionTextAlign = sanitize_text_field($attributes['captionTextAlign'] ?? 'center');
    $onImageClick = sanitize_text_field($attributes['onImageClick'] ?? 'Lightbox');
    $shareOption = sanitize_text_field($attributes['shareOption'] ?? 'None');

    // Generate a stable unique ID based on post ID + block position
    $gallery_id = $galleryKey; // Unique per page & post

    ob_start();
?>
    <div class="infinity-gallery infinity-gallery-<?php echo esc_attr($gallery_uid); ?>" id="<?php echo esc_attr($gallery_id); ?>"
        style="--crop-image-height: <?php echo esc_attr($cropImageHeight); ?>px; --gutter-size: <?php echo esc_attr($gutterSize); ?>px; padding: <?php echo esc_attr($padding); ?>px"
        data-gallery-id="<?php echo esc_attr($gallery_id) ?>"
        data-max-per-row="<?php echo esc_attr($maxPerRow); ?>"
        data-gutter-size="<?php echo esc_attr($gutterSize); ?>"
        data-crop-images="<?php echo esc_attr($cropImages ? 'true' : 'false'); ?>"
        data-hide-info="<?php echo esc_attr($hideInfo ? 'true' : 'false'); ?>"
        data-hide-download="<?php echo esc_attr($hideDownload ? 'true' : 'false'); ?>"
        data-filter-type="<?php echo esc_attr($filterType); ?>"
        data-filter-strength="<?php echo esc_attr($filterStrength); ?>"
        data-on-image-click="<?php echo esc_attr($onImageClick); ?>">
        <?php foreach ($images as $index => $image) :
            if (!isset($image['url']) || !wp_http_validate_url($image['url'])) {
                continue; // Skip invalid URLs
            }

            // Ensure correct size selection
            $selectedSrc = !empty($image['sizes'][$imageSize]['url']) ? esc_url($image['sizes'][$imageSize]['url']) : esc_url($image['url']);
            $fullSrc = !empty($image['sizes']['full']['url']) ? esc_url($image['sizes']['full']['url']) : esc_url($image['url']);

            $captionText = $image['caption'] ?? '';

            if ($limitCaptionCharacters && strlen($captionText) > $captionCharacterLimit) {
                $captionText = substr($captionText, 0, $captionCharacterLimit) . '...';
            }
        ?>
            <figure class="infinity-gallery-item">
                <picture>
                    <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                        alt="<?php echo esc_attr($image['alt'] ?? 'Untitled Image'); ?>"
                        class="infinity-gallery-image"
                        loading="lazy"
                        data-id="<?php echo esc_attr($gallery_id); ?>-<?php echo esc_attr($image['id'] ?? $image['index']); ?>"
                        data-index="<?php echo esc_attr($index); ?>"
                        data-full="<?php echo esc_url($fullSrc); ?>"
                        data-src="<?php echo esc_url($selectedSrc); ?>"
                        data-filename="<?php echo esc_attr(basename($image['url'])); ?>">
                </picture>

                <?php if (!empty($captionText) && $captionPosition === 'On Image') : ?>
                    <figcaption class="infinity-gallery-caption on-image"
                        role="text"
                        aria-live="polite"
                        aria-label="Image caption"
                        style="font-size: <?php echo esc_attr($captionFontSize); ?>px;
                            color: <?php echo esc_attr($captionFontColor); ?>;
                            background-color: <?php echo esc_attr($captionBackgroundColor); ?>;
                            text-align: <?php echo esc_attr($captionTextAlign); ?>;
                            bottom: <?php echo ($shareOption !== 'None') ? '40px' : '0px'; ?>;">
                        <?php echo esc_html($captionText); ?>
                    </figcaption>
                <?php endif; ?>

                <div class="infinity-gallery-meta">
                    <?php if (!empty($captionText) && $captionPosition === 'Below Image') : ?>
                        <figcaption class="infinity-gallery-caption below-image"
                            role="text"
                            aria-live="polite"
                            aria-label="Image caption"
                            style="text-align: <?php echo esc_attr($captionTextAlign); ?>; font-size: <?php echo esc_attr($captionFontSize); ?>px; color: <?php echo esc_attr($captionFontColor); ?>; background-color: <?php echo esc_attr($captionBackgroundColor); ?>;">
                            <?php echo esc_html($captionText); ?>
                        </figcaption>
                    <?php endif; ?>

                    <?php if ($shareOption !== 'None') : ?>
                        <?php
                        // Determine the correct share URL
                        $currentPageURL = esc_url_raw(
                            (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") .
                                "://" . (isset($_SERVER['HTTP_HOST']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_HOST'])) : '') .
                                (isset($_SERVER['REQUEST_URI']) ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'])) : '')
                        );

                        if ($shareOption === 'Image Full URL') {
                            $shareURL = esc_url($fullSrc);
                        } elseif ($shareOption === 'Image Selected URL') {
                            $shareURL = esc_url($selectedSrc);
                        } else { // Lightbox URL
                            $shareURL = esc_url($currentPageURL . '#' . $galleryKey . '-' . $index);
                        }
                        ?>

                        <div class="infinity-gallery-share" aria-label="Share this image">
                            <a href="#" class="infinity-share-copy"
                                data-share-url="<?php echo urlencode($shareURL); ?>"
                                aria-label="Copy share link">
                                <span class="dashicons dashicons-share" aria-hidden="true"></span>
                            </a>

                            <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode($shareURL); ?>"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Share on Facebook">
                                <span class="dashicons dashicons-facebook" aria-hidden="true"></span>
                            </a>

                            <a href="https://pinterest.com/pin/create/button/?url=<?php echo urlencode($shareURL); ?>&media=<?php echo urlencode($shareURL); ?>"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Share on Pinterest">
                                <span class="dashicons dashicons-pinterest" aria-hidden="true"></span>
                            </a>

                            <a href="https://www.reddit.com/submit?url=<?php echo urlencode($shareURL); ?>"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Share on Reddit">
                                <span class="dashicons dashicons-reddit" aria-hidden="true"></span>
                            </a>

                            <a href="https://api.whatsapp.com/send?text=<?php echo urlencode($shareURL); ?>"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Share on WhatsApp">
                                <span class="dashicons dashicons-whatsapp" aria-hidden="true"></span>
                            </a>
                        </div>
                    <?php endif; ?>
                </div>
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

            document.querySelectorAll('.infinity-gallery-<?php echo esc_attr($gallery_uid); ?>').forEach(gallery => {
                // // Dynamic scaling function
                function calculateColumns() {
                    const maxPerRow = parseInt(gallery.dataset.maxPerRow) || 4;
                    const gutterSize = parseInt(gallery.dataset.gutterSize) || 10;
                    const containerWidth = gallery.parentElement ? gallery.parentElement.offsetWidth : window.innerWidth;
                    const screenWidth = Math.min(containerWidth, 2560);

                    if (screenWidth < 768) return 1; // Always 1 image on mobile

                    if (maxPerRow <= 3) {
                        if (screenWidth < 1100) return 1; // 1 column under 1300px
                        if (screenWidth < 1600 || maxPerRow <= 2) return 2; // 2 columns under 1700px
                        return 3; // Otherwise, use 3 columns
                    }

                    // Scale columns based on screen width and maxPerRow
                    return Math.max(1, Math.min(Math.round((screenWidth / 2560) * maxPerRow), maxPerRow));
                }

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

                const originalItems = Array.from(gallery.children); // Clone original items to avoid re-inserting gallery itself
                let columnContainers = [];

                function applyMasonry() {
                    const columns = calculateColumns();

                    if (columnContainers.length === columns) return; // Prevent unnecessary rebuilds

                    gallery.innerHTML = ''; // Clear gallery only once
                    gallery.style.setProperty('--columns', columns);
                    columnContainers = [];

                    // Create column containers
                    for (let i = 0; i < columns; i++) {
                        const column = document.createElement("div");
                        column.classList.add("infinity-gallery-column");
                        gallery.appendChild(column);

                        columnContainers.push(column);
                    }

                    // Move items into columns instead of cloning (preserving event listeners)
                    originalItems.forEach((item, index) => {
                        columnContainers[index % columns].appendChild(item);
                    });
                }

                // Debounce function to prevent excessive calls on resize
                function debounce(func, delay) {
                    let timeout;
                    return function() {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => func.apply(this, arguments), delay);
                    };
                }

                applyMasonry();
                window.addEventListener("resize", debounce(applyMasonry, 300));
            });
        })();
    </script>
<?php
    $output = ob_get_clean();

    if (!$disableCaching) {
        set_transient($cache_key, $output, HOUR_IN_SECONDS);
    }

    return $output;
}
