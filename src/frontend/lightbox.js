
import EXIF from "exif-js";
import debounce from "lodash/debounce";

document.addEventListener("DOMContentLoaded", function () {
    let currentIndex = 0;
    let images = [];
    let galleryID = '';
    let lightboxEventsAdded = false;
    let lastClickTime = 0;

    function openLightbox(index, galleryId) {
        console.log("Triggering Open Lightbox");
        disableScroll();

        currentIndex = index;
        galleryID = galleryId;
        const gallery = document.querySelector(`[data-gallery-id="${galleryId}"]`);

        console.log("Gallery", gallery, gallery.dataset);

        images = [...gallery.querySelectorAll("img")];
        const image = images[currentIndex];
        const lightboxImg = document.querySelector("#lightbox-img");

        const filterType = gallery.dataset.filterType || "none";
        const filterStrength = gallery.dataset.filterStrength || 100;
        const hideInfo = gallery.dataset.hideInfo === "true";
        const hideDownload = gallery.dataset.hideDownload === "true";

        let filterValue = "none";

        if (filterType !== "none") {
            let filterSign = "%";
            
            if (filterType === "blur") {
                filterSign = "px";
            } else if (filterType === "hue-rotate") {
                filterSign = "deg";
            }

            filterValue = `${filterType}(${filterStrength}${filterSign})`;
        }

        lightboxImg.style.filter = filterValue; // Apply filter dynamically

        console.log("Src:", lightboxImg.src);

        if (lightboxImg.src !== image.dataset.full) {
            lightboxImg.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
            lightboxImg.style.opacity = 0.25;
            document.querySelector("#lightbox").classList.add("open");
            
            const viewportWidth = window.innerWidth * 0.9; // 90% of viewport width
            const viewportHeight = window.innerHeight * 0.9; // 90% of viewport height
    
            const newImg = new Image();
            newImg.src = image.dataset.full;
    
            newImg.onload = () => {
                lightboxImg.src = newImg.src; // Replace with actual image
                lightboxImg.style.opacity = 1;

                const imgWidth = newImg.width;
                const imgHeight = newImg.height;
    
                const widthRatio = viewportWidth / imgWidth;
                const heightRatio = viewportHeight / imgHeight;
                const scaleFactor = Math.min(widthRatio, heightRatio); // Choose the smallest factor to fit
    
                lightboxImg.style.width = `${imgWidth * scaleFactor}px`;
                lightboxImg.style.height = `${imgHeight * scaleFactor}px`;

                preloadNextImage();
                setTimeout(() => extractExifMetadata(newImg), 200);
            };
        }

        // Make lightbox visible to assistive tech
        document.querySelector("#lightbox").removeAttribute("aria-hidden");
        document.querySelector("#lightbox").removeAttribute("inert");

        // Show/hide buttons based on gallery settings
        const infoButton = document.querySelector("#lightbox-info");
        const downloadButton = document.querySelector("#lightbox-download");

        if (hideInfo) {
            infoButton.style.display = "none";
            infoButton.setAttribute("aria-hidden", "true");
            infoButton.setAttribute("inert", "true");
        } else {
            infoButton.style.display = "block";
            infoButton.removeAttribute("aria-hidden");
            infoButton.removeAttribute("inert");
        }

        if (hideDownload) {
            downloadButton.style.display = "none";
            downloadButton.setAttribute("aria-hidden", "true");
            downloadButton.setAttribute("inert", "true");
        } else {
            downloadButton.style.display = "block";
            downloadButton.removeAttribute("aria-hidden");
            downloadButton.removeAttribute("inert");
        }

        const metaText = `Loading Metadata...`;
        document.querySelector("#meta-info").innerHTML = metaText;

        updateLightboxButtons();
        updateURL();
    }

    function extractExifMetadata(newImg) {
        console.log("Complete?", newImg.complete)
        // Ensure the image has fully loaded before reading EXIF metadata
        if (!newImg || !newImg.complete) {
            console.warn("Image not fully loaded for EXIF extraction.");
            return;
        }
    
        EXIF.getData(newImg, function () {
            console.log("EXIF?", EXIF, this);
            const metadata = {};
    
            // Extract Camera Make & Model
            const make = EXIF.getTag(this, "Make");
            const model = EXIF.getTag(this, "Model");

            if (make || model) {
                if (model && model.includes(make)) {
                    metadata.camera = model;
                } else {
                    metadata.camera = [make, model].filter(Boolean).join(" ");
                }
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
        const baseUrl = window.location.href.split("#")[0];
        history.replaceState({}, "", `${baseUrl}#${id}`);
    }

    function closeLightbox() {
        document.querySelector("#lightbox").classList.remove("open");

        // Hide lightbox from assistive tech
        document.querySelector("#lightbox").setAttribute("aria-hidden", "true");
        document.querySelector("#lightbox").setAttribute("inert", "true");
        
        const lightboxImg = document.querySelector("#lightbox-img");
        lightboxImg.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
        lightboxImg.style.filter = "none"; // ✅ Reset filter when closing

        history.pushState({}, "", window.location.href.split("#")[0]); // Remove hash
        enableScroll();
        document.querySelector("#lightbox-flip").classList.remove("flipped");
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

        if (!lightboxEventsAdded) {
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
                if (e.key === "ArrowDown") closeLightbox();
            });

            lightboxEventsAdded = true;
        }

        loadFromURL();
    }

    function scaleLightboxImage() {
        const lightboxImg = document.querySelector("#lightbox-img");
        const viewportWidth = window.innerWidth * 0.9; // 90% of viewport width
        const viewportHeight = window.innerHeight * 0.9; // 90% of viewport height

        const imgWidth = lightboxImg.width;
        const imgHeight = lightboxImg.height;

        const widthRatio = viewportWidth / imgWidth;
        const heightRatio = viewportHeight / imgHeight;
        const scaleFactor = Math.min(widthRatio, heightRatio); // Choose the smallest factor to fit

        lightboxImg.style.width = `${imgWidth * scaleFactor}px`;
        lightboxImg.style.height = `${imgHeight * scaleFactor}px`;
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
        if (!touchEndX) return;

        if (swipeDistance > 50) {
            nextImage(); // Swipe left → Go forward
        } else if (swipeDistance < -50) {
            prevImage(); // Swipe right → Go back
        }

        touchStartX = 0;
        touchEndX = 0;
    }

    function disableScroll() {
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh'; // Ensures no vertical movement
    }
    
    function enableScroll() {
        document.body.style.overflow = '';
        document.body.style.height = '';
    }

    document.querySelector("#lightbox-flip").addEventListener("touchstart", handleTouchStart);
    document.querySelector("#lightbox-flip").addEventListener("touchmove", handleTouchMove);
    document.querySelector("#lightbox-flip").addEventListener("touchend", handleTouchEnd);

    document.querySelectorAll('.lightbox button').forEach(button => {
        button.addEventListener('mouseup', () => {
            setTimeout(() => button.blur(), 200); // Removes focus
        });
    });

    document.addEventListener('dblclick', (e) => {
        if (document.querySelector('.lightbox.open')) {
            e.preventDefault(); // Stops zooming
        }
    }, { passive: false });

    document.querySelectorAll("#lightbox-prev").forEach(button => {
        button.addEventListener("touchstart", (event) => {
            prevImage();
            event.stopPropagation();
        });
    });

    document.querySelectorAll("#lightbox-next").forEach(button => {
        button.addEventListener("touchstart", (event) => {
            nextImage();
            event.stopPropagation();
        });
    });

    setupLightbox();
    window.addEventListener("resize", debounce(scaleLightboxImage, 100));
});

document.querySelector("#lightbox-info").addEventListener("click", function () {
    document.querySelector("#lightbox-flip").classList.toggle("flipped");
});
