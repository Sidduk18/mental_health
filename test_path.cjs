const express = require('express');
const app = express();
try {
    app.get('/:all*', (req, res) => {});
    console.log('Success /:all*');
} catch (e) {
    console.log('Fail /:all*', e.message);
}
