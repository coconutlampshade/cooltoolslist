const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function getGeniusLinks(startYear, startMonth, startDay, endYear, endMonth, endDay) {
    const apiKey = "b2c6d35528ba40eb84a10a49a1cb016f";
    const apiSecret = "d8465bb3509d48bdb12938674dfe74b4";
    
    try {
        // Create links directory if it doesn't exist
        const linksDir = path.join(__dirname, 'links');
        try {
            await fs.mkdir(linksDir, { recursive: true });
        } catch (err) {
            if (err.code !== 'EEXIST') throw err;
        }

        // Calculate the date range
        const startDate = new Date(startYear, startMonth - 1, startDay);
        const endDate = new Date(endYear, endMonth - 1, endDay);
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        
        console.log(`Fetching Genius Links from ${startDate.toLocaleString('default', { month: 'long' })} ${startDay}, ${startYear} to ${endDate.toLocaleString('default', { month: 'long' })} ${endDay}, ${endYear}...`);

        const response = await axios({
            method: 'get',
            url: 'https://api.geni.us/v1/links/list',
            params: {
                linksCreatedStart: startStr,
                linksCreatedEnd: endStr,
                take: 1000,  // Request up to 1000 links
                includeArchived: true,
                includeDeleted: true
            },
            headers: {
                'Accept': 'application/json',
                'X-Api-Key': apiKey,
                'X-Api-Secret': apiSecret
            }
        });

        if (response.status === 200 && response.data.Results) {
            const links = response.data.Results;
            const totalClicks = links.reduce((sum, link) => sum + link.TotalClicks, 0);
            
            // Save to file in the links directory
            const output = {
                ErrorMessage: "",
                Username: "cooltools",
                Results: links,
                TotalLinks: links.length,
                Period: {
                    StartDate: startStr,
                    EndDate: endStr
                }
            };

            const filename = `genius_links_${startStr}_to_${endStr}.json`;
            const filePath = path.join(linksDir, filename);
            await fs.writeFile(filePath, JSON.stringify(output, null, 2));
            
            console.log('\n=== Summary ===');
            console.log(`Total links found: ${links.length.toLocaleString()}`);
            console.log(`Total clicks: ${totalClicks.toLocaleString()}`);
            console.log(`Data saved to: ${filePath}`);
            
            if (links.length > 0) {
                console.log('\nProducts mentioned:');
                links.sort((a, b) => {
                    const dateA = new Date(parseInt(a.CreatedUtc.replace('/Date(', '').replace(')/', '')));
                    const dateB = new Date(parseInt(b.CreatedUtc.replace('/Date(', '').replace(')/', '')));
                    return dateB - dateA;  // Sort newest first
                }).forEach(link => {
                    const date = new Date(parseInt(link.CreatedUtc.replace('/Date(', '').replace(')/', '')));
                    console.log(`- [${date.toISOString().split('T')[0]}] ${link.ProductDisplayName1}`);
                    console.log(`  URL: geni.us/${link.ShortUrlCode}`);
                });
            } else {
                console.log('\nNo products were mentioned during this period.');
            }
        }
        
    } catch (error) {
        console.error('\nError:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 6) {
    console.log('Usage: node extract-links.js <startYear> <startMonth> <startDay> <endYear> <endMonth> <endDay>');
    console.log('Example: node extract-links.js 2024 3 1 2024 3 31');
    process.exit(1);
}

const startYear = parseInt(args[0]);
const startMonth = parseInt(args[1]);
const startDay = parseInt(args[2]);
const endYear = parseInt(args[3]);
const endMonth = parseInt(args[4]);
const endDay = parseInt(args[5]);

// Validate inputs
function validateDate(year, month, day, label) {
    if (isNaN(year) || year < 2010 || year > 2050) {
        console.log(`${label} year must be between 2020 and 2025`);
        process.exit(1);
    }
    if (isNaN(month) || month < 1 || month > 12) {
        console.log(`${label} month must be between 1 and 12`);
        process.exit(1);
    }
    if (isNaN(day) || day < 1 || day > 31) {
        console.log(`${label} day must be between 1 and 31`);
        process.exit(1);
    }
    
    const date = new Date(year, month - 1, day);
    if (date.getMonth() !== month - 1 || date.getDate() !== day) {
        console.log(`Invalid ${label} date (e.g., February 31 does not exist)`);
        process.exit(1);
    }
    return date;
}

const startDate = validateDate(startYear, startMonth, startDay, "Start");
const endDate = validateDate(endYear, endMonth, endDay, "End");

// Validate date range
if (endDate < startDate) {
    console.log('End date must be after start date');
    process.exit(1);
}

getGeniusLinks(startYear, startMonth, startDay, endYear, endMonth, endDay); 