const fs = require("fs");
const path = require("path");

// Paths
const packageJsonPath = path.join(__dirname, "package.json");
const phpFilePath = path.join(__dirname, "infinity-gallery.php");

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const newVersion = packageJson.version;

// Read the PHP file
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

console.log(`Updated infinity-gallery.php to version ${newVersion}`);
