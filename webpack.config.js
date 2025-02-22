const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const RemovePlugin = require('remove-files-webpack-plugin');
const path = require('path');

module.exports = {
    ...defaultConfig,
    output: {
        path: path.resolve(__dirname, "public"), // Change "build" to "public"
        filename: "[name].js",
    },
    plugins: [
        ...defaultConfig.plugins,

        // Remove unnecessary files after the build process
        new RemovePlugin({
            after: {
                root: './public',
                include: [
                    'gallery-rtl.css', 
                    'gallery.asset.php', 
                    'index.asset.php',
                    'index-rtl.css',
                    'lightbox.asset.php'
                ],
                trash: false
            }
        })
    ]
};