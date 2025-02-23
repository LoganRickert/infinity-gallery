import { registerBlockType } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { useBlockProps, MediaUpload, InspectorControls } from '@wordpress/block-editor';
import { Button, TextControl, PanelBody, RangeControl, SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';

const IMAGE_SIZES = [
    { label: 'Thumbnail (150px)', value: 'thumbnail' },
    { label: 'Medium (300px)', value: 'medium' },
    { label: 'Large (1024px)', value: 'large' },
    { label: 'Full (Original)', value: 'full' },
    { label: '1536px', value: '1536x1536' },
    { label: '2048px', value: '2048x2048' }
];

const FILTERS = [
    { label: 'None', value: 'none' },
    { label: 'Grayscale', value: 'grayscale' },
    { label: 'Sepia', value: 'sepia' },
    { label: 'Blur', value: 'blur' },
    { label: 'Brightness', value: 'brightness' },
    { label: 'Contrast', value: 'contrast' },
    { label: 'Saturate', value: 'saturate' },
    { label: 'Invert', value: 'invert' },
    { label: 'Hue Rotate', value: 'hue-rotate' }
];

// Register the block
registerBlockType('infinity/gallery', {
    title: __('Infinity Gallery', 'infinity-gallery'),
    icon: 'format-gallery',
    category: 'media',
    attributes: {
        images: { type: 'array', default: [] },
        maxPerRow: { type: 'number', default: 4 },
        imageSize: { type: 'string', default: 'large' },
        gutterSize: { type: 'number', default: 10 },
        cropImages: { type: 'boolean', default: false },
        hideInfo: { type: 'boolean', default: false },
        hideDownload: { type: 'boolean', default: false },
        filterType: { type: 'string', default: 'none' },
        filterStrength: { type: 'number', default: 100 },
        galleryKey: { type: 'string', default: 'gallery_' }
    },
    edit: ({ attributes, setAttributes }) => {
        const blockProps = useBlockProps();
        const { galleryKey, images, maxPerRow, imageSize, gutterSize, cropImages, hideInfo, hideDownload, filterType, filterStrength } = attributes;
        
        // Fetch all Infinity Gallery blocks in the current post
        const existingGalleries = useSelect((select) => {
            return select('core/block-editor').getBlocks().filter(block => block.name === 'infinity/gallery');
        }, []);

        // Function to generate a unique gallery key
        const generateUniqueGalleryKey = () => {
            const baseKey = 'gallery'; // Default base name
            let counter = 1;

            // Get all existing gallery keys
            const existingKeys = existingGalleries.map(block => block.attributes.galleryKey);

            if (existingKeys.length === 0) {
                return baseKey;
            }

            // Find next available number (gallery, gallery-2, gallery-3, etc.)
            let newKey = baseKey;
            
            while (existingKeys.includes(newKey)) {
                counter++;
                newKey = `${baseKey}-${counter}`;
            }

            return newKey;
        };

        // If the galleryKey is empty (first time block is inserted), assign a unique one
        if (galleryKey === "gallery_") {
            const newKey = generateUniqueGalleryKey();
            setAttributes({ galleryKey: newKey });
        }

        // Function to sort images numerically & alphabetically
        const sortImagesByFilename = (images) => {
            return images.sort((a, b) => {
                const nameA = a.url.split('/').pop().toLowerCase(); // Extract filename from URL
                const nameB = b.url.split('/').pop().toLowerCase();

                const matchA = nameA.match(/(.*?)(\d+)?(\.\w+)$/) || [];
                const matchB = nameB.match(/(.*?)(\d+)?(\.\w+)$/) || [];

                const baseA = matchA ? matchA[1] : nameA;
                const baseB = matchB ? matchB[1] : nameB;
                const numA = matchA && matchA[2] ? parseInt(matchA[2], 10) : Infinity;
                const numB = matchB && matchB[2] ? parseInt(matchB[2], 10) : Infinity;

                if (baseA < baseB) return -1;
                if (baseA > baseB) return 1;

                return numA - numB;
            });
        };

        // Function to open media library
        const selectImages = (newImages) => {
            const sortedImages = sortImagesByFilename(newImages);

            setAttributes({
                images: sortedImages.map(image => ({
                    id: image.id,
                    url: image.url,
                    alt: image.alt,
                    caption: image.caption,
                    description: image.description,
                    fullUrl: image.sizes?.full?.url || image.url, // Full size for download
                    thumbnailUrl: image.sizes?.thumbnail?.url || image.url, // Smallest version
                    sizes: image.sizes || {}
                }))
            });
        };

        let filterLabel = __('Filter Strength (%)', 'infinity-gallery');
        let minFilterRange = 0;
        let maxFilterRange = 100;

        if (filterType === 'blur') {
            filterLabel = __('Blur Strength (px)', 'infinity-gallery');
            maxFilterRange = 50;
        } else if (filterType === 'hue-rotate') {
            filterLabel = __('Hue Rotation (deg)', 'infinity-gallery');
            maxFilterRange = 360;
        }

        return (
            <div {...blockProps}>
                <InspectorControls>
                    <PanelBody title={__('Gallery Settings', 'infinity-gallery')}>
                        <TextControl
                            label={__('Gallery Key', 'infinity-gallery')}
                            value={galleryKey}
                            onChange={(value) => setAttributes({ galleryKey: value })}
                            help={__('Used for stable permalinks and indexing. Must be unique if you have more than 1 gallery on a post.', 'infinity-gallery')}
                        />
                        <RangeControl
                            label={__('Max Images Per Row', 'infinity-gallery')}
                            value={maxPerRow}
                            onChange={(value) => setAttributes({ maxPerRow: value })}
                            min={1}
                            max={10}
                        />
                        <SelectControl
                            label={__('Image Size', 'infinity-gallery')}
                            value={imageSize}
                            options={IMAGE_SIZES}
                            onChange={(value) => setAttributes({ imageSize: value })}
                        />
                        <RangeControl
                            label={__('Gutter Size (px)', 'infinity-gallery')}
                            value={gutterSize}
                            onChange={(value) => setAttributes({ gutterSize: value })}
                            min={0}
                            max={50}
                        />
                        <ToggleControl
                            label={__('Crop Images to Uniform Height', 'infinity-gallery')}
                            checked={cropImages}
                            onChange={(value) => setAttributes({ cropImages: value })}
                        />
                    </PanelBody>

                    <PanelBody title={__('Lightbox Settings', 'infinity-gallery')}>
                        <ToggleControl
                            label={__('Hide Info Button', 'infinity-gallery')}
                            checked={hideInfo}
                            onChange={(value) => setAttributes({ hideInfo: value })}
                        />
                        <ToggleControl
                            label={__('Hide Download Button', 'infinity-gallery')}
                            checked={hideDownload}
                            onChange={(value) => setAttributes({ hideDownload: value })}
                        />
                    </PanelBody>

                    <PanelBody title={__('Image Filters', 'infinity-gallery')}>
                    <SelectControl
                            label={__('Filter Type', 'infinity-gallery')}
                            value={filterType}
                            options={FILTERS}
                            onChange={(value) => setAttributes({ filterType: value })}
                        />
                        {filterType !== 'none' && (
                            <RangeControl
                                label={filterLabel}
                                value={filterStrength}
                                onChange={(value) => setAttributes({ filterStrength: value })}
                                min={minFilterRange}
                                max={maxFilterRange}
                            />
                        )}
                    </PanelBody>
                </InspectorControls>

                <div className="infinity-gallery-editor">
                    {images.length > 0 ? (
                        <div className="infinity-gallery-preview">
                            {images.map((image) => (
                                <img key={image.id} src={image.thumbnailUrl} alt={image.alt} role="img" aria-label={image.alt || 'Gallery image'} />
                            ))}
                        </div>
                    ) : (
                        <div className="infinity-gallery-placeholder">
                            <p>{__('Click "Select Images" to add a gallery.', 'infinity-gallery')}</p>
                        </div>
                    )}

                    <MediaUpload
                        onSelect={selectImages}
                        allowedTypes={['image']}
                        multiple
                        gallery
                        value={images.map(img => img.id)}
                        render={({ open }) => (
                            <Button isPrimary onClick={open}>
                                {__('Select Images', 'infinity-gallery')}
                            </Button>
                        )}
                    />

                    {images.length > 0 && (
                        <Button
                            isDestructive
                            isSmall
                            onClick={() => setAttributes({ images: [] })}>
                            {__('Remove All Images', 'infinity-gallery')}
                        </Button>
                    )}
                </div>
            </div>
        );
    },
    save: () => {
        return null; // The frontend is handled via PHP render callback
    }
});
