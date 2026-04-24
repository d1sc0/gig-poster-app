import * as htmlToImage from 'html-to-image';

/**
 * Captures the specified DOM element and triggers a browser download as a PNG.
 *
 * Technical Note: Even though the artboard is visually scaled down in the browser
 * using CSS transforms, this function captures it at its full defined pixel resolution
 * by temporarily overriding styles during the snapshot process.
 */
export function savePoster(node, themeId, sizeValue, venue, date) {
  if (!node) return;

  // Get the raw dimensions defined in CSS (e.g. 1080px or 2480px)
  // (e.g. 1080px) before the preview scale is applied.
  const width = node.offsetWidth;
  const height = node.offsetHeight;

  // --- Construct dynamic filename ---
  const formattedSize = (() => {
    switch (sizeValue) {
      case 'insta-post':
        return 'post';
      case 'insta-story':
        return 'story';
      case 'a4-print':
        return 'a4';
      default:
        return 'poster';
    }
  })();
  const formattedVenue = venue
    ? venue.toLowerCase().replace(/\s+/g, '-')
    : 'unknown-venue';
  const formattedDate = (() => {
    if (!date) return 'unknown-date';
    const [year, month, day] = date.split('-'); // YYYY-MM-DD from input type="date"
    return `${day}-${month}-${year.substring(2)}`; // DD-MM-YY
  })();

  const filename = `${formattedSize}-${formattedVenue}-${formattedDate}.png`;

  htmlToImage
    .toPng(node, {
      skipFonts: true,
      width: width,
      height: height,
      // We reset the transform to 'none' here so the exported image
      // is rendered at 100% size, ignoring the preview zoom.
      style: {
        transform: 'none', // Reset the preview scale for the snapshot
        margin: '0',
        left: '0',
        top: '0',
      },
    })
    .then(dataUrl => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    })
    .catch(error => {
      console.error('Export failed:', error);
    });
}
