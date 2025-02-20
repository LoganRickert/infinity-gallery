
import EXIF from "exif-js";
import debounce from "lodash/debounce";

const loadingGif = "/wp-content/plugins/infinity-gallery/assets/loading.gif";

document.addEventListener("DOMContentLoaded", function () {
    let currentIndex = 0;
    let images = [];
    let galleryID = '';
    let lastClickTime = 0;

    function openLightbox(index, gallery) {
        currentIndex = index;
        images = [...document.querySelectorAll(`[data-gallery-id="${gallery}"] img`)];
        galleryID = gallery;

        const image = images[currentIndex];
        const lightboxImg = document.querySelector("#lightbox-img");

        lightboxImg.src = loadingGif;
        document.querySelector("#lightbox").classList.add("open");

        const newImg = new Image();
        newImg.src = image.dataset.full;

        newImg.onload = () => {
            lightboxImg.src = newImg.src; // Replace with actual image
        };

        // Make lightbox visible to assistive tech
        document.querySelector("#lightbox").removeAttribute("aria-hidden");
        document.querySelector("#lightbox").removeAttribute("inert");

        const metaText = `Loading Metadata...`;
        document.querySelector("#meta-info").innerHTML = metaText;

        scaleLightboxImage();
        updateLightboxButtons();
        updateURL();

        // Extract metadata using EXIF.js
        extractExifMetadata(image.dataset.full);

        preloadNextImage();
    }

    function extractExifMetadata(imageUrl) {
        const img = document.createElement("img");
        img.src = imageUrl;

        img.onload = () => {
            EXIF.getData(img, function () {
                const metadata = {};
    
                // Extract Camera Make & Model
                const make = EXIF.getTag(this, "Make");
                const model = EXIF.getTag(this, "Model");
                if (make || model) {
                    metadata.camera = [make, model].filter(Boolean).join(" ");
                }
    
                // Extract ISO
                const iso = EXIF.getTag(this, "ISOSpeedRatings");
                if (iso) metadata.ISO = iso;
    
                // Extract Focal Length
                const focalLength = EXIF.getTag(this, "FocalLength");
                if (focalLength) metadata.focal_length = `${focalLength}mm`;
    
                // Extract Aperture
                const aperture = EXIF.getTag(this, "FNumber");
                if (aperture) metadata.aperture = `f/${aperture}`;
    
                // Extract Exposure Time (Convert 0.00025 to 1/4000 sec)
                const exposureTime = EXIF.getTag(this, "ExposureTime");
                if (exposureTime) {
                    metadata.exposure = formatExposureTime(exposureTime);
                }
    
                // Extract IPTC Data (Credit & Copyright)
                const iptcData = EXIF.getTag(this, "IPTC") || {};
                if (iptcData["Credit"]) metadata.credit = iptcData["Credit"];
                if (iptcData["Copyright"]) metadata.copyright = iptcData["Copyright"];
    
                // Extract and Convert DateTime to Local Timezone
                const dateTimeOriginal = EXIF.getTag(this, "DateTimeOriginal");
                if (dateTimeOriginal) {
                    metadata.dateTime = formatDateTime(dateTimeOriginal);
                }

                displayMetadata(metadata);
            });
        };
    }

    // Convert Exposure Time to Proper Fraction (e.g., 1/3000 sec)
    function formatExposureTime(exposureTime) {
        if (exposureTime >= 1) return `${exposureTime} sec`;
        const denominator = Math.round(1 / exposureTime);
        return `1/${denominator} sec`;
    }

    // Convert DateTime to Local Timezone
    function formatDateTime(dateTimeString) {
        const [date, time] = dateTimeString.split(" ");
        const [year, month, day] = date.split(":");
        const [hour, minute, second] = time.split(":");

        const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
        return utcDate.toLocaleString(); // Converts to user's local timezone
    }

    function displayMetadata(metadata) {
        let metaText = "";
    
        if (metadata.camera) metaText += `<strong>Camera:</strong> ${metadata.camera}<br>`;
        if (metadata.ISO) metaText += `<strong>ISO:</strong> ${metadata.ISO}<br>`;
        if (metadata.focal_length) metaText += `<strong>Focal Length:</strong> ${metadata.focal_length}<br>`;
        if (metadata.aperture) metaText += `<strong>Aperture:</strong> ${metadata.aperture}<br>`;
        if (metadata.exposure) metaText += `<strong>Exposure:</strong> ${metadata.exposure}<br>`;
        if (metadata.dateTime) metaText += `<strong>Date Taken:</strong> ${metadata.dateTime}<br>`;
        if (metadata.credit) metaText += `<strong>Credit:</strong> ${metadata.credit}<br>`;
        if (metadata.copyright) metaText += `<strong>Copyright:</strong> ${metadata.copyright}<br>`;
    
        document.querySelector("#meta-info").innerHTML = metaText || "<strong>No metadata available</strong>";
    }

    function loadFromURL() {
        const hash = window.location.hash;
        const match = hash.match(/#(g[0-9]+)-(\d+)/); // Match gallery ID & image index

        if (match) {
            const gallery = match[1]; // Extract gallery ID
            const imageIndex = parseInt(match[2], 10); // Extract image index

            // Find all images in the matching gallery
            const imagesInGallery = [...document.querySelectorAll(`[data-gallery-id="${gallery}"] img`)];

            if (imagesInGallery.length > 0 && imageIndex >= 0 && imageIndex < imagesInGallery.length) {
                openLightbox(imageIndex, gallery); // Open the correct image
            }
        }
    }

    function updateURL() {
        const id = images[currentIndex].dataset.id;
        const baseUrl = window.location.href.split("#")[0]; // Keep original URL
        history.pushState({}, "", `${baseUrl}#${id}`); // Remove duplicate gallery ID
    }

    function closeLightbox() {
        document.querySelector("#lightbox").classList.remove("open");

        // Hide lightbox from assistive tech
        document.querySelector("#lightbox").setAttribute("aria-hidden", "true");
        document.querySelector("#lightbox").setAttribute("inert", "true");
        
        setTimeout(() => {
            const lightboxImg = document.querySelector("#lightbox-img");
            lightboxImg.src = loadingGif;
        }, 500);

        history.pushState({}, "", window.location.href.split("#")[0]); // Remove hash
    }

    function nextImage() {
        const now = Date.now();
        if (now - lastClickTime < 250) return;
        lastClickTime = now;

        if (currentIndex < images.length - 1) openLightbox(currentIndex + 1, galleryID);
    }

    function prevImage() {
        const now = Date.now();
        if (now - lastClickTime < 250) return;
        lastClickTime = now;

        if (currentIndex > 0) openLightbox(currentIndex - 1, galleryID);
    }

    function downloadImage() {
        const img = document.querySelector("#lightbox-img");
        const fullUrl = img.src;
        const filename = images[currentIndex].dataset.filename || "download.jpg"; // Get real filename

        const link = document.createElement("a");
        link.href = fullUrl;
        link.download = filename; // Use real file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function updateLightboxButtons() {
        document.querySelector("#lightbox-prev").style.display = currentIndex === 0 ? "none" : "block";
        document.querySelector("#lightbox-next").style.display = currentIndex === images.length - 1 ? "none" : "block";
    }

    function setupLightbox() {
        document.querySelectorAll(".infinity-gallery").forEach(gallery => {
            const galleryId = gallery.dataset.galleryId;
            const imgs = gallery.querySelectorAll("img");

            imgs.forEach((img, index) => {
                img.dataset.id = `${galleryId}-${index}`;
                img.dataset.full = img.getAttribute("data-full"); // Ensure full image URL
                img.addEventListener("click", () => openLightbox(index, galleryId));
            });
        });

        document.querySelector("#lightbox-close").addEventListener("click", closeLightbox);
        document.querySelector("#lightbox-next").addEventListener("click", nextImage);
        document.querySelector("#lightbox-prev").addEventListener("click", prevImage);
        document.querySelector("#lightbox-download").addEventListener("click", downloadImage);

        // Prevent duplicate tap events on mobile
        document.querySelector("#lightbox-next").addEventListener("touchend", (e) => e.preventDefault());
        document.querySelector("#lightbox-prev").addEventListener("touchend", (e) => e.preventDefault());

        // Close lightbox when clicking outside the image
        document.querySelector("#lightbox").addEventListener("click", function (e) {
            if (e.target === this) closeLightbox();
        });

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") nextImage();
            if (e.key === "ArrowLeft") prevImage();
        });

        loadFromURL();
    }

    function scaleLightboxImage() {
        const lightboxImg = document.querySelector("#lightbox-img");
        const viewportWidth = window.innerWidth * 0.9; // 90% of viewport width
        const viewportHeight = window.innerHeight * 0.9; // 90% of viewport height

        const img = new Image();
        img.src = lightboxImg.src;
        img.onload = function () {
            const imgWidth = img.width;
            const imgHeight = img.height;

            const widthRatio = viewportWidth / imgWidth;
            const heightRatio = viewportHeight / imgHeight;
            const scaleFactor = Math.min(widthRatio, heightRatio); // Choose the smallest factor to fit

            lightboxImg.style.width = `${imgWidth * scaleFactor}px`;
            lightboxImg.style.height = `${imgHeight * scaleFactor}px`;
        };
    }

    function preloadNextImage() {
        if (currentIndex < images.length - 1) {
            const nextImg = new Image();
            nextImg.src = images[currentIndex + 1].dataset.full;
        }
    }

    let touchStartX = 0;
    let touchEndX = 0;

    function handleTouchStart(event) {
        touchStartX = event.touches[0].clientX;
    }

    function handleTouchMove(event) {
        touchEndX = event.touches[0].clientX;
    }

    function handleTouchEnd() {
        const swipeDistance = touchStartX - touchEndX;

        if (swipeDistance > 50) {
            nextImage(); // Swipe left → Go forward
        } else if (swipeDistance < -50) {
            prevImage(); // Swipe right → Go back
        }
    }

    document.querySelector("#lightbox").addEventListener("touchstart", handleTouchStart);
    document.querySelector("#lightbox").addEventListener("touchmove", handleTouchMove);
    document.querySelector("#lightbox").addEventListener("touchend", handleTouchEnd);

    setupLightbox();
    window.addEventListener("resize", debounce(scaleLightboxImage, 100));
});

document.querySelector("#lightbox-info").addEventListener("click", function () {
    document.querySelector("#lightbox-flip").classList.toggle("flipped");
});
