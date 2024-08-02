const express = require('express');
const { getWebUrls, createWebUrl, deleteWebUrl } = require('../controllers/webUrlController');

const router = express.Router();

router.get('/', getWebUrls);
router.post('/', createWebUrl);
router.delete('/:id', deleteWebUrl);

module.exports = router;
