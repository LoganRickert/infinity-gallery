### 📖 **Infinity Gallery - A High-Performance WordPress Gallery Plugin**  

Infinity Gallery is a lightweight, high-performance WordPress gallery plugin designed for seamless image browsing. It supports infinite scrolling, dynamic image loading, mobile-friendly swipe gestures, a feature-rich lightbox, and optimized image selection for different screen sizes.  

![Gutenberg Block Photo](./.github/infinity-gallery-preview-1.jpg)

![Lightbox](./.github/infinity-gallery-preview-2.jpg)

![Lightbox Metadata](./.github/infinity-gallery-preview-3.jpg)

---

## 🚀 **Features**  
- **Infinite Scrolling**: Dynamically loads images as the user scrolls.  
- **Optimized Image Loading**: Serves the best image size based on screen resolution.  
- **Mobile-Friendly**: Supports swipe gestures for navigating the lightbox.  
- **Lightbox with EXIF Metadata**: Displays EXIF metadata with a smooth flipping animation.  
- **Preload Next Image**: Ensures smooth transitions while browsing.  
- **Download & Info Buttons**: Allows users to download images and view metadata.  
- **Adjustable Gutter Size**: Customize spacing between images.  
- **Responsive Layout**: Adjusts the number of images per row dynamically.  
- **Gutenberg Block Support**: Easily add galleries via the WordPress block editor.  
- **Customizable Lightbox Controls**: Hide the **Info** and **Download** buttons via block settings.  
- **CSS Filters for Images**: Apply effects like **grayscale, sepia, blur, contrast, hue-rotate, and more** with adjustable strength.  

---

## 📥 **Installation**  
### **1. Manual Installation:**  
- Download the latest version of **Infinity Gallery** from https://github.com/LoganRickert/infinity-gallery/releases
- Upload the plugin to `wp-content/plugins/`.  
- Extract and activate it from the **Plugins** menu.  

### **2. Automatic Installation:**  
- Go to **Plugins > Add New** in your WordPress dashboard.  
- Search for **Infinity Gallery**.  
- Click **Install Now** and then **Activate**.  

---

## 🛠 **Usage**  
### **Adding a Gallery (Gutenberg Block)**  
1. Open the WordPress **block editor**.  
2. Click **Add Block (+)** and search for **Infinity Gallery**.  
3. Click **Select Images** to choose images from your media library.  
4. Adjust **Max Images Per Row** to customize the layout.  
5. Set **Gutter Size** for spacing between images.  
6. Toggle **Lightbox Info & Download Buttons** on/off as needed.  
7. Choose an **Image Filter** and adjust strength if desired.  
8. Publish or update your post/page.  

### **Lightbox Navigation**  
- **Click an image** to open it in full-screen mode.  
- **Swipe left/right (mobile) or click Next/Prev** to navigate.  
- **Click "Info"** to flip the image and view metadata.  
- **Click "Download"** to save the image.  
- **Click outside the image or press "X"** to close the lightbox.  

---

## 🎨 **Image Filters**  
Infinity Gallery now supports **CSS filters**, allowing you to apply effects to all gallery images!  

| Filter Type | Description | Strength Range |
|------------|-------------|--------------|
| **None** | No filter applied | N/A |
| **Grayscale** | Converts image to grayscale | 0% - 100% |
| **Sepia** | Applies sepia tone | 0% - 100% |
| **Blur** | Softens image details | 0px - 50px |
| **Brightness** | Adjusts brightness | 0% - 100% |
| **Contrast** | Adjusts contrast levels | 0% - 100% |
| **Saturate** | Increases or decreases color saturation | 0% - 100% |
| **Invert** | Inverts colors | 0% - 100% |
| **Hue Rotate** | Rotates image colors | 0° - 360° |

🔹 **Lightbox images inherit the filter only if the gallery has a filter applied!**  

---

## 📐 **Responsive Layout**  

| Screen Width        | Images Per Row |
|--------------------|---------------|
| < 768px (Mobile)   | 1             |
| 768px - 1279px (Tablet) | 2         |
| 1280px - 1919px (1080p) | 3         |
| > 1920px (1440p+)  | 4+            |

🔹 **Supports up to 10 images per row with auto-scaling.**  

---

## 📦 **Packaging & Deployment**  
To generate a packaged version of the plugin for manual installation, run:  
```sh
npm run package
```
This creates a `dist/infinity-gallery.zip` file, ready for upload to another WordPress site.  

---

## 📜 **License**  
This plugin is licensed under the **Apache License 2.0**.  

---

## 🙌 **Contributing**  
Feel free to submit **issues, feature requests, or pull requests** on the [GitHub repository](#).  

---

## 📝 **Changelog**  

### v1.4.0 (Latest Version)  
🔹 **New Features:**  
- **Hide Lightbox Buttons**: Option to hide the **Info** and **Download** buttons.  
- **CSS Image Filters**: Apply effects like **grayscale, blur, brightness, contrast, and hue-rotate**.  
- **Dynamically Adjustable Strength**: Filters adjust dynamically based on selection.  
- **Filters Apply to Lightbox**: Lightbox preview now inherits filters from its gallery.  
- **Performance Optimizations**: Improved lazy loading and reduced unnecessary image requests.  

### v1.0.0 (Initial Release)  
- Initial version with dynamic image loading, lightbox, swipe gestures, and optimized image selection.  

---

## 🔥 **Enjoy a Blazing Fast WordPress Gallery!**  
Infinity Gallery is built for **speed, performance, and usability**. 🎉 Try it today!
