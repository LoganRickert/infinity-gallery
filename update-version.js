const fs = require("fs");
const path = require("path");

// Paths
const packageJsonPath = path.join(__dirname, "package.json");
const phpFilePath = path.join(__dirname, "infinity-gallery.php");
const blockJsonPath = path.join(__dirname, "block.json");

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const newVersion = packageJson.version;

// Update infinity-gallery.php
if (fs.existsSync(phpFilePath)) {
    let phpContent = fs.readFileSync(phpFilePath, "utf8");

    // Replace the INFINITY_GALLERY_VERSION constant
    phpContent = phpContent.replace(
        /define\('INFINITY_GALLERY_VERSION', '.*?'\);/,
        `define('INFINITY_GALLERY_VERSION', '${newVersion}');`
    );

    // Replace the Version field in the plugin header
    phpContent = phpContent.replace(
        /\* Version: \d+\.\d+\.\d+/,
        `* Version: ${newVersion}`
    );

    // Write updated content back to the PHP file
    fs.writeFileSync(phpFilePath, phpContent);
    console.log(`✅ Updated infinity-gallery.php to version ${newVersion}`);
} else {
    console.error(`❌ Error: ${phpFilePath} not found.`);
}

// Update block.json
if (fs.existsSync(blockJsonPath)) {
    let blockJson = JSON.parse(fs.readFileSync(blockJsonPath, "utf8"));

    // Update the version field
    blockJson.version = newVersion;

    // Write updated content back to block.json
    fs.writeFileSync(blockJsonPath, JSON.stringify(blockJson, null, 4));
    console.log(`✅ Updated block.json to version ${newVersion}`);
} else {
    console.error(`❌ Error: ${blockJsonPath} not found.`);
}
