const fs = require('fs');

const filePath = '/Users/Bhargav/Documents/test';

// Check if the file exists
fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
        console.error('File does not exist:', err);
    } else {
        console.log('File exists');
    }
});
