const fs = require('fs');
const path = require('path');

const linksDir = path.join(__dirname, 'links');
const outputDir = path.join(__dirname, 'clean-links');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Process each JSON file
fs.readdirSync(linksDir).forEach(file => {
    if (file.endsWith('.json')) {
        const filePath = path.join(linksDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Clean the data to only include what we need
        const cleanData = {
            Results: data.Results.map(item => ({
                ShortUrlCode: item.ShortUrlCode,
                ProductDisplayName1: item.ProductDisplayName1,
                ProductDisplayName2: item.ProductDisplayName2,
                ProductArtworkThumbnailUrl150: item.ProductArtworkThumbnailUrl150,
                CreatedUtc: item.CreatedUtc,
                TotalClicks: item.TotalClicks
            }))
        };
        
        // Write cleaned data
        const outputPath = path.join(outputDir, file);
        fs.writeFileSync(outputPath, JSON.stringify(cleanData, null, 2));
    }
});

console.log('Data cleaning complete!'); 