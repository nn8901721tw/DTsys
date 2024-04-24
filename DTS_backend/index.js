require('dotenv').config()
const express = require('express');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();
const http = require('http');
const {Server} = require('socket.io');
const { Socket } = require('dgram');
const server = http.createServer(app);
const Task = require('./models/task');
const Column = require('./models/column');
const Node = require('./models/node');
const Node_relation = require('./models/node_relation');

const { rm } = require('fs');
const controller = require('./controllers/kanban'); 

const io = new Server(server, {
    cors:{
        origin: "http://localhost:5173",
        methods: ['GET', 'PUT', 'POST'],
        credentials: true
    },
});
// 將 io 實例附加到 app 上
app.set('io', io);

app.use(cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'PUT', 'POST'],
    credentials: true
}));
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: false }));


//every socket.io thing is inside here 
io.on("connection", (socket) => {
    console.log(`${socket.id} a user connected`);
    //join room
    socket.on("join_room", (data) =>{
        socket.join(data);
        console.log(`${socket.id} join room ${data}`);
    })
    //send message
    socket.on("send_message", (data) =>{
        console.log(data);
        socket.to(data.room).emit("receive_message", data);
    })
    //Delete card
    socket.on("cardDelete", async (data) => {
        const { cardData, index, columnId, kanbanData } = data;
        console.log("columnIndex",columnId);
        // Step 1: Retrieve the column and update it
        try {
            const column = await Column.findOne({
                where: {
                    id: columnId
                }
            });
            console.log(cardData)

            console.log("column", column)
            if (column) {
                // Filter out the task ID from the tasks array

                const updatedTasks = column.task.filter(taskId => taskId !== cardData.id);

                // Update the column with the new tasks array
                await column.update({ task: updatedTasks });

                // Step 2: Destroy the task in the Task table after updating the column
                const updateTask = await Task.destroy({
                    where: {
                        id: cardData.id
                    }
                });

                // Emit the updated task information to all clients
                io.sockets.emit("taskItem", updateTask);
            } else {
                console.error('Column not found or column tasks undefined');
                // Optionally emit an error or handle it as necessary
            }
        } catch (error) {
            console.error('Error handling card delete:', error);
            // Handle errors and possibly emit error information to clients
        }
    });
    // 在客户端连接后处理projectId和房间加入逻辑
    socket.on("joinProject", (projectId) => {
        socket.join(projectId);
        console.log(`Socket ${socket.id} joined room for project ${projectId}`);
    });
    //create card
    socket.on("taskItemCreated", async (data) => {
        const { selectedcolumn, item, kanbanData,projectId } = data;
        console.log("222222222222222222222222222222222",projectId);
        const { title, content, labels, assignees } = item;
        const creatTask = await Task.create({
            title: title,
            content: content,
            labels: labels,
            assignees: assignees,
            columnId : kanbanData[selectedcolumn].id
        })
        const  addIntoTaskArray = await Column.findByPk(creatTask.columnId)
        addIntoTaskArray.task = [...addIntoTaskArray.task, creatTask.id];
        await addIntoTaskArray.save()
        .then(()=>console.log("taskItemCreatedsuccess!!!!!!!!!"))
        io.to(projectId).emit("taskItems", addIntoTaskArray);
    })
    //update card
    socket.on("cardUpdated", async(data) =>{
        const { cardData, index, columnIndex, kanbanData,projectId} = data;
        const updateTask = await Task.update(cardData,{
            where:{
                id : cardData.id
            }
        });
        io.to(projectId).emit("taskItem", updateTask);
   
    })
    //drag card
    socket.on("cardItemDragged", async(data) => { 
        const { destination, source, kanbanData ,projectId} = data;
        const dragItem = {
            ...kanbanData[source.droppableId].task[source.index],
        };
        kanbanData[source.droppableId].task.splice(source.index, 1);
        kanbanData[destination.droppableId].task.splice(
            destination.index,
            0,
            dragItem
        );

        console.log("dragtaskItem", kanbanData);
        io.to(projectId).emit("dragtaskItem", kanbanData);
        const sourceColumn = kanbanData[source.droppableId].task.map( item => item.id);
        const destinationColumn = kanbanData[destination.droppableId].task.map( item => item.id);
        await Column.update({task:sourceColumn},{
            where:{
                id: kanbanData[source.droppableId].id
            }
        });
        await Column.update({task:destinationColumn},{
            where:{
                id: kanbanData[destination.droppableId].id
            }
        });
        await Task.update({columnId:kanbanData[destination.droppableId].id},{
            where:{
                id: dragItem.id
            }
        });
    });

    //ideawall_scaffolding
    socket.on("taskUpdated", async (data) => {
       
        io.sockets.emit("taskItems", "2");
    })
  


    socket.on('tasksCreated', async (data) => {
        const { columnId, newTasksIds,projectId } = data;
        // 更新column中的tasks
        // ...
        // 发送更新后的column给所有客户端
        const updatedColumn = await Column.findByPk(columnId);
        io.to(projectId).emit('columnUpdated', updatedColumn);
      });

    //create nodes
    socket.on("nodeCreate", async(data) =>{
        const { title, content, ideaWallId, owner, from_id,projectId } = data;
        const createdNode = await Node.create({
            title:title,
            content:content,
            ideaWallId:ideaWallId,
            owner:owner
        });
        if(from_id){
            const nodeRelation = await Node_relation.create({
                from_id:from_id,
                to_id: createdNode.id,
                ideaWallId:ideaWallId
            })
        }
        io.to(projectId).emit("nodeUpdated", createdNode);
    })

    socket.on("nodeUpdate", async(data) =>{
        const { title, content, id,projectId} = data;
        const createdNode = await Node.update(
            {
                title:title,
                content:content
            },
            {
                where:{
                    id: id
                }
            }
        );
        io.to(projectId).emit("nodeUpdated", createdNode);
    })
    socket.on("nodeDelete", async(data) =>{
        const {id , projectId} = data;
        const deleteNode = await Node.destroy(
            {
                where:{
                    id: id
                }
            }
        );
        io.sockets.emit("nodeUpdated", deleteNode);
    })


    // 监听来自前端的 createTeamDaily 事件
    socket.on("createTeamDaily", async (data) => {
        const { projectId, formData } = data;
        // 这里假设 createTeamDaily 是你要触发的业务逻辑
        try {
            const newDaily = await createTeamDaily(formData); // 假设这是一个异步函数来处理日志创建
            io.sockets.emit("teamDailyCreated", newDaily); // 广播事件到特定项目的房间
        } catch (error) {
            console.error("Error creating team daily:", error);
            socket.emit("error", { message: "Failed to create team daily" });
        }
    });

    socket.on('taskSubmitted', (data) => {
        console.log('Task submitted:KKKKKKKKKK', data);
        // 将事件广播到所有连接的客户端，除了发送消息的客户端
        // io.sockets.emit("taskItems", addIntoTaskArray);

        socket.broadcast.emit('refreshKanban', data);
    });


    socket.on("disconnect", () => {
        console.log(`${socket.id} a user disconnected`)
    });
});

//api routes
app.use('/users', require('./routes/user'));
app.use('/projects', require('./routes/project'))
app.use('/kanbans', require('./routes/kanban'))
app.use('/ideaWall', require('./routes/ideaWall'))
app.use('/node', require('./routes/node'))
app.use('/daily', require('./routes/daily'))
app.use('/submit', require('./routes/submit'))
app.use('/stage', require('./routes/stage'))
app.use('/getScaffoldingTemplate', require('./routes/getScaffoldingTemplate'))
app.use('/task', require('./routes/task'))

//error handling
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
});


// sync database
sequelize.sync({ alter: true})  //{force:true} {alter:true}
    .then( result => {
        controller.initializeData(); // 如果還沒有初始化過資料，則執行初始化資料的函式
    console.log("Database connected");
    server.listen(3000);
    })
    .catch(err => console.log(err));


// server.listen(3000, () => {
//     console.log('server is running');
// });