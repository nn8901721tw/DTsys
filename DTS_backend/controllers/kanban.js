const Kanban = require('../models/kanban');
const Column = require('../models/column');
const Task = require('../models/task');
const Project = require('../models/project');
const Kanban_scaffolding = require('../models/kanban_scaffolding'); // 正確的模組名稱


exports.getKanban = async ( req, res ) => {
    const projectId = req.params.projectId;
    //kanban
    const kanbanData = await Kanban.findAll({
        attributes:[
            'id',
            'column'],
        where:{
            projectId : projectId
        },
    })
 // ...其他代码，比如获取数据的逻辑
 if (!kanbanData || kanbanData.length === 0) {
    // 处理空数组的情况
    return res.status(404).json({ error: 'No kanban data found.' });
  }
  
  const { id, column } = kanbanData[0];

    //column
    const columnData = await Column.findAll({
            attributes:[
                'id',
                'name',
                'task'
            ],
            where:{
                kanbanId : id
            }
    })
    const sortedColumnData = [];
    const arrone = columnData.findIndex( item => item.id === column[0]);
    sortedColumnData.push(columnData[arrone]);
    const arrtwo = columnData.findIndex( item => item.id === column[1]);
    sortedColumnData.push(columnData[arrtwo]);
    // const arrthree = columnData.findIndex( item => item.id === column[2]);
    // sortedColumnData.push(columnData[arrthree]);
    //task
    const taskData1 = await Task.findAll({
        attributes:[
            'id', 
            'title', 
            'content', 
            'labels', 
            'assignees'
        ],
        where:{
            columnId : sortedColumnData[0].id
        }
    })
    const sortTaskData1 = [];
    sortedColumnData[0].task.map( column => {
        taskData1.map((task, index) => {
            if(task.id === column){
                sortTaskData1.push(taskData1[index])
            }
        })
    })
    sortedColumnData[0].task = sortTaskData1;
    const taskData2 = await Task.findAll({
        attributes:[
            'id', 
            'title', 
            'content', 
            'labels', 
            'assignees'
        ],
        where:{
            columnId : sortedColumnData[1].id
        }
    })
    const sortTaskData2 = [];
    sortedColumnData[1].task.map(column => {
        taskData2.map((task, index) => {
            if(task.id === column){
                sortTaskData2.push(taskData2[index])
            }
        })
    })
    sortedColumnData[1].task = sortTaskData2;
    // const taskData3 = await Task.findAll({
    //     attributes:[
    //         'id', 
    //         'title', 
    //         'content', 
    //         'labels', 
    //         'assignees'
    //     ],
    //     where:{
    //         columnId : sortedColumnData[2].id
    //     }
    // })
    // const sortTaskData3 = [];
//     sortedColumnData[2].task.map(column => {
//         taskData3.map((task, index) => {
//             if(task.id === column){
//                 sortTaskData3.push(taskData3[index])
//             }
//         })
//     })
    // sortedColumnData[2].task = sortTaskData3;
    res.status(200).json(sortedColumnData);

}

exports.getKanbanTask = async ( req, res ) =>{
    
    const columnId = req.params.columnId;
    const taskData = await Task.findAll({
        attributes:[
            'id', 
            'title', 
            'content', 
            'labels', 
            'assignees'
        ],
        where:{
            columnId : columnId
        }
    })
    .then( result =>{
        res.status(200).json(result);
    })
    .catch( err => {
        console.log(err);
        res.status(500).send({message: 'Something Wrong!'})
    });
}


exports.getKanbanTemplateTask = async ( req, res ) =>{
    
    const { stage, subStage } = req.body;
    const taskTemplateData = await Kanban_scaffolding.findAll({
        attributes:[
            'id', 
            'scaffolding_template', 

        ],
        where:{
            sub_stage :`${stage}-${subStage}`
        }
    })
    .then( result =>{
        res.status(200).json(result);
    })
    .catch( err => {
        console.log(err);
        res.status(500).send({message: 'Something Wrong!'})
    });
}

// exports.createKanban = async ( projectId ) => {
   
//     const kanban = await Kanban.create({
//         column:[], 
//         projectId:projectId
//     });
//     const todo = await Column.create({
//         name:"處理", 
//         task:[], 
//         kanbanId:kanban.id
//     });
//     const inProgress = await Column.create({
//         name:"進行中", 
//         task:[], 
//         kanbanId:kanban.id
//     });
//     const Completed = await Column.create({
//         name:"完成", 
//         task:[], 
//         kanbanId:kanban.id
//     });
//     Kanban.findByPk(kanban.id)
//     .then(kanban =>{
//         kanban.column = [
//             todo.id, 
//             inProgress.id, 
//             Completed.id 
//         ];
//         return kanban.save();
//     });

   
// }


exports.initializeData =async()=>{
    try {
        await Kanban_scaffolding.bulkCreate([
            { id:'1',sub_stage: '1-1', scaffolding_template: '各自拋出經驗' },
            { id:'2',sub_stage: '1-1', scaffolding_template: '網路查找相關資料' },
            { id:'3',sub_stage: '1-2', scaffolding_template: '列出利害關係人' },
            { id:'4',sub_stage: '1-2', scaffolding_template: '歸納利害關係人' },
            { id:'5',sub_stage: '1-3', scaffolding_template: '思考利害關係人可能遇到的問題' },
            { id:'6',sub_stage: '1-3', scaffolding_template: '思考要訪談的問題' },
            { id:'7',sub_stage: '1-4', scaffolding_template: '蒐集資料並彙整（實際場域訪談、網路）' },
            { id:'8',sub_stage: '1-4', scaffolding_template: '歸納利害關係人遇到的問題（找出問題的根本）' },
            // { id:'9',sub_stage: '2-1', scaffolding_template: '考量成本、時間' },
            // { id:'9',sub_stage: '2-1', scaffolding_template: '定義出真正值得解決的問題' },
            { id:'9',sub_stage: '2-1', scaffolding_template: '討論與反思' },  //團隊成員間就初步問題進行討論，確認問題的有效性和相關性。
            { id:'10',sub_stage: '2-2', scaffolding_template: '定義出真正值得解決的問題' },
            // { id:'10',sub_stage: '2-2', scaffolding_template: '使用公平的投票方式' },
            { id:'11',sub_stage: '3-1', scaffolding_template: '一次針對一個問題進行解決方案發想' },
            { id:'12',sub_stage: '3-1', scaffolding_template: '考量成本、時間' },
            { id:'13',sub_stage: '3-2', scaffolding_template: '組內整合解決方法' },
            { id:'14',sub_stage: '4-1', scaffolding_template: '開始實作原型(Figma、Draw.io)' },
            { id:'15',sub_stage: '5-1', scaffolding_template: '將原型進行實際場域測試' },
            { id:'16',sub_stage: '5-1', scaffolding_template: '蒐集並分析場域測試結果' },
            { id:'17',sub_stage: '5-2', scaffolding_template: '整理出修正要點' },          
            { id:'18',sub_stage: '5-2', scaffolding_template: '開始修正原型' }
            // 添加更多資料...
        ], { updateOnDuplicate: ['sub_stage', 'scaffolding_template'] });
        console.log("Data initialized successfully");
    } catch (error) {
        console.error("Error initializing data:", error);
    }
}

// 處理獲取 Scaffolding Template 的請求
exports.getScaffoldingTemplate = async (req, res) => {
    try {
      const { stage, subStage } = req.body;
  
      // 根據 stage 和 subStage 查詢相應的 scaffolding template
      const scaffoldingTemplates = await Kanban_scaffolding.findAll({
        attributes:[
            'scaffolding_template', 
            // 'title', 
            // 'content', 
            // 'labels', 
            // 'assignees'
        ],
        where:{
            sub_stage : `${stage}-${subStage}`
        }
    }
      );
  
      if (scaffoldingTemplates.length === 0) {
        return res.status(404).json({ message: 'Scaffolding templates not found' });
      }
  
      res.status(200).json(scaffoldingTemplates);
    } catch (error) {
      console.error('Error while getting scaffolding templates:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.moveTaskToCompleted = async (req, res) => {
    const { taskId, inProgressColumnId, completedColumnId } = req.body;

    try {
        // 嘗試找到相關的列
        const inProgressColumn = await Column.findByPk(inProgressColumnId);
        const completedColumn = await Column.findByPk(completedColumnId);

        if (!inProgressColumn || !completedColumn) {
            // 如果其中一個列不存在，返回錯誤
            return res.status(404).send({ message: 'One or both columns not found' });
        }

        // 更新任務的 columnId
        const updateResult = await Task.update({ columnId: completedColumnId }, {
            where: { id: taskId }
        });

        console.log(updateResult); // 添加這行來檢查更新結果

        if (updateResult[0] === 0) {
            // 如果沒有任務被更新，也返回錯誤
            return res.status(404).send({ message: 'Task not found or update failed' });
        }

        // 從進行中列中移除任務
        if (inProgressColumn.task && inProgressColumn.task.includes(taskId)) {
            inProgressColumn.task = inProgressColumn.task.filter(id => id !== taskId);
            await inProgressColumn.save();
        }

// 將任務ID添加到完成列
if (!completedColumn.task.includes(taskId)) {
    const updatedCompletedTasks = [...completedColumn.task, taskId];
    completedColumn.setDataValue('task', updatedCompletedTasks); // 強制更新欄位
    await completedColumn.save();
}

        res.status(200).send({ message: 'Task moved successfully' });
    } catch (error) {
        console.error('Error moving task:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
