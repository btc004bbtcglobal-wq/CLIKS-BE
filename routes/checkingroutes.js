const {checkingController} = require('../controllers/checkingcontroller');

const router = express.Router();
router.get('/checking',checkingController)

module.exports = router;