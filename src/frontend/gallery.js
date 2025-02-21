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
        let currentColumns = getComputedStyle(gallery).gridTemplateColumns.split(" ").length;

        console.log("Setting column count");

        let newColumns = 1;
        if (window.innerWidth > 2000) newColumns = Math.min(4, maxPerRow);
        else if (window.innerWidth >= 1280) newColumns = Math.min(3, maxPerRow);
        else if (window.innerWidth >= 768) newColumns = Math.min(2, maxPerRow);

        // Only update if the number of columns actually changes
        if (currentColumns !== newColumns) {
            gallery.style.gridTemplateColumns = `repeat(${newColumns}, 1fr)`;
        }
    }

    // Initialize grid correctly when the page loads
    updateGrid();
    window.addEventListener("resize", debounce(updateGrid, 50));
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
