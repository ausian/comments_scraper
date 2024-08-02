const express = require('express');
const { getSources, createSource } = require('../controllers/sourceController');

const router = express.Router();

router.get('/', getSources);
router.post('/', createSource);

module.exports = router;
