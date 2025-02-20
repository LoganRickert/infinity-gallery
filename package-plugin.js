const fs = require('fs-extra');
const archiver = require('archiver');
const path = require('path');

const pluginName = 'infinity-gallery';
const distFolder = path.join(__dirname, 'dist');
const pluginFolder = path.join(distFolder, pluginName);
const zipFile = path.join(distFolder, `${pluginName}.zip`);

async function packagePlugin() {
    try {
        console.log('📦 Cleaning old package...');
        await fs.remove(distFolder);
        await fs.ensureDir(pluginFolder);

        console.log('📂 Copying necessary files...');
        await fs.copy('infinity-gallery.php', path.join(pluginFolder, 'infinity-gallery.php'));
        await fs.copy('readme.txt', path.join(pluginFolder, 'readme.txt'));
        await fs.copy('includes', path.join(pluginFolder, 'includes'));
        await fs.copy('build', path.join(pluginFolder, 'build'));
        await fs.copy('assets', path.join(pluginFolder, 'assets'));

        console.log('🗜️ Creating ZIP package...');
        const output = fs.createWriteStream(zipFile);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => console.log(`✅ Plugin packaged successfully: ${zipFile} (${archive.pointer()} bytes)`));
        archive.on('error', (err) => { throw err; });

        archive.pipe(output);
        archive.directory(pluginFolder, pluginName);
        await archive.finalize();
    } catch (error) {
        console.error('❌ Error packaging plugin:', error);
    }
}

packagePlugin();
