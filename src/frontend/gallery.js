import "./styles.css";
import debounce from 'lodash/debounce';

document.addEventListener("DOMContentLoaded", function () {
    document.body.scrollTop = document.documentElement.scrollTop = 0;

    const galleries = document.querySelectorAll('.infinity-gallery');

    galleries.forEach(gallery => {
        const maxPerRow = parseInt(gallery.dataset.maxPerRow, 10) || 3;
        setupGallery(gallery, maxPerRow);
    });
});

function setupGallery(gallery, maxPerRow) {
    applyResponsiveGrid(gallery, maxPerRow);
    lazyLoadImages(gallery);
}

function applyResponsiveGrid(gallery, maxPerRow) {
    function updateGrid() {
        if (!gallery) return;

        // Ensure maxPerRow is respected
        let newColumns = 1;
        const windowWidth = window.innerWidth;

        if (windowWidth > 2000) newColumns = Math.min(4, maxPerRow);
        else if (windowWidth >= 1280) newColumns = Math.min(3, maxPerRow);
        else if (windowWidth >= 768) newColumns = Math.min(2, maxPerRow);

        // Prevent unnecessary updates
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
    }, { rootMargin: "200px 0px" }); // Load images 200px before they appear

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
