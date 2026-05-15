const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const meetupController = require('../controllers/meetupController');

router.get('/', meetupController.getMeetups);
// Using auth to ensure user is logged in
router.post('/', auth, meetupController.createMeetup);
router.patch('/:id/join', auth, meetupController.joinMeetup);
router.get('/:id/attendees', auth, meetupController.getAttendees);
router.get('/:id/verify/:userId', meetupController.verifyRegistration);

module.exports = router;
