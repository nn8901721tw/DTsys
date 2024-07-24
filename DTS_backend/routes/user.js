const express = require('express');
const router = express.Router();
const controller = require('../controllers/user');



// Route for getting teachers
router.get('/teachers', (req, res) => {
    console.log('GET /users/teachers endpoint hit router!!!!!!');
    res.send('Test route working');
});

// Other routes
router.get('/', (req, res) => {
    console.log('GET /users endpoint hit router!!!!!!');
    controller.getUsers(req, res);
});
router.get('/:userId', controller.getUser);
router.get('/project/:projectId', controller.getProjectUsers);
router.post('/login', controller.loginUser);
router.post('/register', controller.registerUser);




// router.put('/:userId', controller.updateUser);
// router.delete('/:userId', controller.deleteUser);


module.exports = router;