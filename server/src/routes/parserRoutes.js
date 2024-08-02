const express = require('express');
const { parseAndSaveData } = require('../controllers/parserController');

const router = express.Router();

router.post('/', parseAndSaveData);

module.exports = router;
