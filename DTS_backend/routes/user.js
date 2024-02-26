const controller = require('../controllers/user');
const router = require('express').Router();

//CRUD Routes /users
router.get('/', controller.getUsers);
router.get('/:userId', controller.getUser);
router.get('/project/:projectId', controller.getProjectUsers)
router.post('/login', controller.loginUser);
router.post('/register', controller.registerUser);
// router.put('/:userId', controller.updateUser);
// router.delete('/:userId', controller.deleteUser);

module.exports = router;