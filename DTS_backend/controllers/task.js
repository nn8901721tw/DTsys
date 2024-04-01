const Task = require('../models/task'); // 导入 Sequelize 模型
const Column = require('../models/column');
// controllers/task.js

exports.createTaskAndUpdateColumn = async (req, res) => {
    const { content, columnId } = req.body;
    const io = req.app.get('io');
    try {
        // 創建新任務
        const newTask = await Task.create({
            content: content,
            columnId: columnId,
            title: "默認標題", // 從 req.body 獲取或設置默認值
            // 其他字段...
        });

        // 打印新建任務的ID
        console.log("New Task ID:", newTask.id);

        // 獲取對應的 column
        const column = await Column.findByPk(columnId);
        if (!column) {
            throw new Error('Column not found');
        }

        // 將新任務的ID加入到 column.task 陣列中
        const updatedTaskIds = Array.isArray(column.task) ? [...column.task, newTask.id] : [newTask.id];
        
        // 使用 update 方法更新 column 的 task 欄位
        await Column.update({ task: updatedTaskIds }, { where: { id: columnId } });
        // 獲取更新後的 column 數據
        const updatedColumn = await Column.findByPk(columnId);


        // 回應前端創建成功
        return res.status(201).json({ taskId: newTask.id, updatedColumn: updatedColumn });
    } catch (error) {
        // 捕獲並打印錯誤信息
        console.error('Error creating new task or updating column:', error);
        return res.status(500).json({ error: error.message });
    }
};
