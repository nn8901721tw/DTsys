const express = require('express');
const router = express.Router();
const Controller = require('../controllers/task');

// 定义创建新 Task 的路由
router.post('/', Controller.createTaskAndUpdateColumn);

module.exports = router;
