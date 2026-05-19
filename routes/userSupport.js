const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getUserTickets,
  createUserTicket
} = require('../controllers/supportController');

// All endpoints require user authentication
router.use(auth);

router.get('/', getUserTickets);
router.post('/', createUserTicket);

module.exports = router;
