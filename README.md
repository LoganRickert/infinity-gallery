# Infinity Gallery - A High-Performance WordPress Gallery Plugin

## 📖 Description
Infinity Gallery is a powerful and lightweight WordPress gallery plugin designed for high performance and seamless image browsing. It supports infinite scrolling, dynamic image loading, mobile swipe gestures, lightbox navigation, and optimized image selection for different screen sizes.

## 🚀 Features
- **Infinite Scrolling**: Dynamically loads images as the user scrolls.
- **Optimized Image Loading**: Serves the best image size based on screen resolution.
- **Mobile-Friendly**: Supports swipe gestures for navigating the lightbox.
- **Lightbox with EXIF Metadata**: Displays EXIF metadata with a smooth flipping animation.
- **Preload Next Image**: Ensures smooth transitions while browsing.
- **Download & Info Buttons**: Allows users to download images and view metadata.
- **Responsive Layout**: Adjusts the number of images per row dynamically.
- **Gutenberg Block Support**: Easily add galleries via the WordPress block editor.

## 📥 Installation
1. **Automatic Installation**:
   - Go to **Plugins > Add New** in your WordPress dashboard.
   - Search for **Infinity Gallery**.
   - Click **Install Now** and then **Activate**.

2. **Manual Installation**:
   - Download the latest version of **Infinity Gallery**.
   - Upload the plugin to `wp-content/plugins/`.
   - Extract and activate it from the **Plugins** menu.

## 🛠 Usage
### Adding a Gallery (Gutenberg Block)
1. Open the WordPress **block editor**.
2. Click **Add Block (+)** and search for **Infinity Gallery**.
3. Click **Select Images** to choose images from your media library.
4. Adjust **Max Images Per Row** to customize the layout.
5. Publish or update your post/page.

### Lightbox Navigation
- **Click an image** to open it in full-screen mode.
- **Swipe left/right (mobile) or click Next/Prev** to navigate.
- **Click "Info"** to flip the image and view metadata.
- **Click "Download"** to save the image.
- **Click outside the image or press "X"** to close the lightbox.

## 📐 Responsive Layout
| Screen Width        | Images Per Row |
|--------------------|---------------|
| < 768px (Mobile)   | 1             |
| 768px - 1279px (Tablet) | 2         |
| 1280px - 1919px (1080p) | 3         |
| > 1920px (1440p+)  | 4             |

## 🔧 Troubleshooting
### Images Are Loading Incorrectly
- Ensure **lazy loading** is working by checking the **Network tab** in Developer Tools (`F12`).
- Confirm that the **correct image sizes** are being served (`thumbnail`, `medium`, `large`).

### Lightbox Not Opening
- Make sure **JavaScript is not being blocked** by a caching or optimization plugin.
- Try **disabling other gallery plugins** to check for conflicts.

### Mobile Issues
- If swipe gestures aren’t working, ensure **JavaScript touch events are enabled**.
- For accidental zooming, ensure the **double-tap zoom prevention** is active.

## 📦 Packaging & Deployment
To generate a packaged version of the plugin for manual installation, run:
```sh
npm run package
```
This creates a `dist/infinity-gallery.zip` file, ready for upload to another WordPress site.

## 📜 License
This plugin is licensed under the **Apache License 2.0**.

## 🙌 Contributing
Feel free to submit **issues, feature requests, or pull requests** on the [GitHub repository](#).

## 📝 Changelog
### v1.0.0 (Initial Release)
- Initial version with dynamic image loading, lightbox, swipe gestures, and optimized image selection.

---
Infinity Gallery is built for **speed, performance, and usability**. Enjoy a seamless WordPress gallery experience! 🎉

