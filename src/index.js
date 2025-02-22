import { registerBlockType } from '@wordpress/blocks';
import { MediaUpload, InspectorControls } from '@wordpress/block-editor';
import { Button, PanelBody, RangeControl, SelectControl } from '@wordpress/components';
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

// Register the block
registerBlockType('infinity/gallery', {
    title: __('Infinity Gallery', 'infinity-gallery'),
    icon: 'format-gallery',
    category: 'media',
    attributes: {
        images: {
            type: 'array',
            default: [],
        },
        maxPerRow: {
            type: 'number',
            default: 4,
        },
        imageSize: {
            type: 'string',
            default: 'large'
        }
    },
    edit: ({ attributes, setAttributes }) => {
        const { images, maxPerRow, imageSize  } = attributes;
    
        // Function to sort images numerically & alphabetically
        const sortImagesByFilename = (images) => {
            return images.sort((a, b) => {
                const nameA = a.url.split('/').pop().toLowerCase(); // Extract filename from URL
                const nameB = b.url.split('/').pop().toLowerCase();

                const matchA = nameA.match(/(.*?)(\d+)?(\.\w+)$/);
                const matchB = nameB.match(/(.*?)(\d+)?(\.\w+)$/);

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
                    sizes: image.sizes || {},
                }))
            });
        };
    
        return (
            <>
                <InspectorControls>
                    <PanelBody title={__('Gallery Settings', 'infinity-gallery')}>
                        <RangeControl
                            label={__('Max Images Per Row', 'infinity-gallery')}
                            value={maxPerRow}
                            onChange={(value) => setAttributes({ maxPerRow: value })}
                            min={1}
                            max={4}
                        />
                        <SelectControl
                            label={__('Image Size', 'infinity-gallery')}
                            value={imageSize}
                            options={IMAGE_SIZES}
                            onChange={(value) => setAttributes({ imageSize: value })}
                        />
                    </PanelBody>
                </InspectorControls>
                
                <div className="infinity-gallery-editor">
                    {images.length > 0 ? (
                        <div className="infinity-gallery-preview">
                            {images.map((image) => (
                                <img key={image.id} src={image.thumbnailUrl} alt={image.alt} />
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
            </>
        );
    },
    save: () => {
        return null; // The frontend is handled via PHP render callback
    },
});
