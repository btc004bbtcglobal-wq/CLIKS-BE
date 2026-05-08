const express = require('express');
const router = express.Router();
const manufacturingController = require('../controllers/manufacturingController');
const { auth } = require('../middleware/auth');

router.use(auth);

const businessOnly = (req, res, next) => {
    if (req.user && req.user.role === 'business') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Business account required.' });
    }
};

router.use(businessOnly);

router.post('/bom', manufacturingController.createBom);
router.post('/orders', manufacturingController.createOrder);
router.post('/start', manufacturingController.startProduction);
router.post('/complete', manufacturingController.completeProduction);
router.get('/reports', manufacturingController.getReports);

module.exports = router;
