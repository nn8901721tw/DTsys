const controller = require('../controllers/kanban');
const router = require('express').Router();

router.post('/', controller.getScaffoldingTemplate);


module.exports = router;