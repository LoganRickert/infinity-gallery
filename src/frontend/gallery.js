import "./styles.css";
import debounce from 'lodash/debounce';

document.addEventListener("DOMContentLoaded", function () {
    const galleries = document.querySelectorAll('.infinity-gallery');

    galleries.forEach(gallery => {
        const maxPerRow = parseInt(gallery.dataset.maxPerRow, 10) || 3;
        setupGallery(gallery, maxPerRow);
    });

    setTimeout(() => {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }, 50);
});

function setupGallery(gallery, maxPerRow) {
    applyResponsiveGrid(gallery, maxPerRow);
    lazyLoadImages(gallery);
}

function applyResponsiveGrid(gallery, maxPerRow) {
    function calculateColumns() {
        const screenWidth = Math.min(window.innerWidth, 2560); // Limit at 1440p (2560px)
        
        if (screenWidth < 768) return 1; // Always 1 image on mobile

        if (maxPerRow <= 3) {
            if (screenWidth < 1100) return 1; // 1 column under 1300px
            if (screenWidth < 1600) return 2; // 2 columns under 1700px
            return 3; // Otherwise, use 3 columns
        }

        // Dynamically scale images per row based on maxPerRow
        return Math.max(1, Math.min(Math.round((screenWidth / 2560) * maxPerRow), maxPerRow));
    }

    function updateGrid() {
        console.log("Calling Update Grid", maxPerRow)
        if (!gallery) return;

        // Ensure maxPerRow is respected
        const newColumns = calculateColumns();

        // Only update if the number of columns actually changes
        if (gallery.dataset.currentColumns !== String(newColumns)) {
            console.log(`Updating columns to: ${newColumns}`);
            gallery.style.gridTemplateColumns = `repeat(${newColumns}, 1fr)`;
            gallery.dataset.currentColumns = String(newColumns);
        }
    }

    // Initialize grid on load
    updateGrid();

    // Prevent multiple event listeners
    if (!gallery.dataset.listenerAdded) {
        window.addEventListener("resize", debounce(updateGrid, 100));
        gallery.dataset.listenerAdded = "true";
    }

    // Detect if the gallery is modified (e.g., reloaded via AJAX or Reactivity)
    const observer = new MutationObserver(updateGrid);
    observer.observe(gallery, { childList: true, subtree: true });
}

function lazyLoadImages(gallery) {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const picture = entry.target;

            if (entry.isIntersecting) {
                const sources = picture.querySelectorAll("source");
                sources.forEach(source => {
                    if (source.dataset.srcset) {
                        source.srcset = source.dataset.srcset;
                        source.removeAttribute("data-srcset"); // Prevent reloading
                    }
                });

                const img = picture.querySelector("img");

                if (img.dataset.full) {
                    img.src = img.dataset.full;
                }

                img.onload = () => {
                    img.classList.add("loaded");
                };

                img.style.opacity = 1;
                observer.unobserve(picture);
            }
        });
    }, { rootMargin: "400px 0px" }); // Load images 400px before they appear

    // Load images already in view
    gallery.querySelectorAll("picture").forEach(picture => {
        const rect = picture.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
            picture.querySelectorAll("source").forEach(source => {
                if (source.dataset.srcset) {
                    source.srcset = source.dataset.srcset;
                    source.removeAttribute("data-srcset");
                }
            });

            const img = picture.querySelector("img");
            
            if (img.dataset.full) {
                img.src = img.dataset.full;
            }

            img.onload = () => {
                img.classList.add("loaded");
            };

            img.style.opacity = 1;
        } else {
            observer.observe(picture);
        }
    });
}
