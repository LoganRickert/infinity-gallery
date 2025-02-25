import "./styles.css";

document.addEventListener("DOMContentLoaded", function () {
    const galleries = document.querySelectorAll('.infinity-gallery');

    galleries.forEach(gallery => {
        lazyLoadImages(gallery);
    });

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
