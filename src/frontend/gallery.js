import "./styles.css";
import debounce from 'lodash/debounce';

document.addEventListener("DOMContentLoaded", function () {
    const galleries = document.querySelectorAll('.infinity-gallery');

    galleries.forEach(gallery => {
        const maxPerRow = parseInt(gallery.dataset.maxPerRow, 10) || 3;
        const gutterSize = parseInt(gallery.dataset.gutterSize) || 10;
        setupGallery(gallery, maxPerRow, gutterSize);
    });

    function copyToClipboard(event, element) {
        event.preventDefault(); // Prevents link from jumping

        const shareUrl = element.getAttribute("data-share-url");
        if (!shareUrl) return;

        navigator.clipboard.writeText(shareUrl).then(() => {
            element.classList.add("copied");
            element.setAttribute("aria-label", "Copied!");

            setTimeout(() => {
                element.classList.remove("copied");
                element.setAttribute("aria-label", "Copy share link");
            }, 2000);
        }).catch(err => {
            console.error("Error copying link: ", err);
        });
    }

    // Attach event listeners to share copy buttons
    document.querySelectorAll(".infinity-share-copy").forEach(copyBtn => {
        copyBtn.addEventListener("click", function (event) {
            event.preventDefault(); // Prevents link from jumping

            const shareUrl = copyBtn.getAttribute("data-share-url");
            if (!shareUrl) return;

            navigator.clipboard.writeText(shareUrl).then(() => {
                copyBtn.classList.add("copied");
                copyBtn.setAttribute("aria-label", "Copied!");

                setTimeout(() => {
                    copyBtn.classList.remove("copied");
                    copyBtn.setAttribute("aria-label", "Copy share link");
                }, 2000);
            }).catch(err => {
                console.error("Error copying link: ", err);
            });
        });
    });
});

function setupGallery(gallery, maxPerRow, gutterSize) {
    applyResponsiveGrid(gallery, maxPerRow, gutterSize);
    lazyLoadImages(gallery);
}

function applyResponsiveGrid(gallery, maxPerRow, gutterSize) {
    function calculateColumns() {
        const containerWidth = gallery.parentElement ? gallery.parentElement.offsetWidth : window.innerWidth;
        const screenWidth = Math.min(containerWidth, 2560);
        
        if (screenWidth < 768) return 1; // Always 1 image on mobile

        if (maxPerRow <= 3) {
            if (screenWidth < 1100) return 1; // 1 column under 1300px
            if (screenWidth < 1600 || maxPerRow <= 2) return 2; // 2 columns under 1700px
            return 3; // Otherwise, use 3 columns
        }

        // Dynamically scale images per row based on maxPerRow
        return Math.max(1, Math.min(Math.round((screenWidth / 2560) * maxPerRow), maxPerRow));
    }

    function updateGrid() {
        if (!gallery) return;

        // Ensure maxPerRow is respected
        const newColumns = calculateColumns();

        // Only update if the number of columns actually changes
        if (gallery.dataset.currentColumns !== String(newColumns)) {
            gallery.style.gridTemplateColumns = `repeat(${newColumns}, 1fr)`;
            gallery.dataset.currentColumns = String(newColumns);
        }

        gallery.style.gap = `${gutterSize}px`;
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

function loadPicture(picture) {
    picture.querySelectorAll("source").forEach(source => {
        if (source.dataset.srcset) {
            source.srcset = source.dataset.srcset;
            source.removeAttribute("data-srcset");
        }
    });

    const img = picture.querySelector("img");
    if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
    }

    img.onload = () => img.classList.add("loaded");
    img.style.opacity = 1;
}

function lazyLoadImages(gallery) {
    if (gallery.dataset.lazyObserverAdded) return; // Prevent duplicate observers

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const picture = entry.target;

            if (entry.isIntersecting) {
                loadPicture(picture);
                observer.unobserve(picture);
            }
        });

        gallery.dataset.lazyObserverAdded = "true";
    }, { rootMargin: "400px 0px" }); // Load images 400px before they appear

    // Load images already in view
    gallery.querySelectorAll("picture").forEach(picture => {
        const rect = picture.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
            loadPicture(picture);
        } else {
            observer.observe(picture);
        }
    });
}
