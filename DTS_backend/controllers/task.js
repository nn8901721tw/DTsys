const Task = require('../models/task'); // 导入 Sequelize 模型

// controllers/task.js
exports.createTask = async (req, res) => {
    const { content, columnId } = req.body;
    try {
        const newTask = await Task.create({
            content: content,
            columnId: columnId,
            title: "默认标题", // 提供一个默认标题或从req.body获取
            // 其他字段...
        });
        return res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating new task:', error);
        return res.status(500).json({ error: error.message });
    }
};
