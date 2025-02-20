const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const RemovePlugin = require('remove-files-webpack-plugin');

module.exports = {
    ...defaultConfig,
    plugins: [
        ...defaultConfig.plugins,

        // Remove unnecessary files after the build process
        new RemovePlugin({
            after: {
                root: './build',
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