const express = require('express');
const router = express.Router();
const { auth, allowRoles } = require('../middleware/auth');
const {
  supportAgentLogin,
  getAgentTickets,
  claimTicket,
  respondTicket,
  escalateTicket
} = require('../controllers/supportController');

// Public Support Gate
router.post('/login', supportAgentLogin);

// Secure Portal Routes (Must be support agent)
router.use(auth);
router.use(allowRoles('support_agent'));

router.get('/tickets', getAgentTickets);
router.patch('/tickets/:id/claim', claimTicket);
router.patch('/tickets/:id/respond', respondTicket);
router.patch('/tickets/:id/escalate', escalateTicket);

module.exports = router;
