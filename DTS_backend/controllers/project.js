const Project = require('../models/project')
const User = require('../models/user')
const Kanban = require('../models/kanban');
const Column = require('../models/column');
const shortid = require('shortid')
const Idea_wall = require('../models/idea_wall');
const Process = require('../models/process');
const Stage = require('../models/stage');
const Sub_stage = require('../models/sub_stage');
const User_project = require('../models/userproject');
const Kanban_scaffolding = require('../models/kanban_scaffolding');

exports.getProject = async(req, res) =>{
    const projectId = req.params.projectId;
    await Project.findByPk(projectId)
        .then(result =>{
            console.log(result);
            res.status(200).json(result)
        })
        .catch(err => console.log(err));
}

exports.getAllProject = async(req, res) => {
    const userId = req.query.userId;
    await Project.findAll({ 
        include:[{
            model:User,
            attributes:[],
            where :{
            id:userId
        },
        }] 
    })
    .then(result =>{
        console.log(result);
        res.status(200).json(result)
    })
    .catch(err => console.log(err));

    
    // user.getProject()
    //     .then(result =>{
    //         console.log(result);
    //         res.status(200).json({ project: result})
    //     })
    //     .catch(err => console.log(err));
}

exports.createProject = async(req, res) => {
    const projectName = req.body.projectName;
    const projectdescribe = req.body.projectdescribe;
    const projectMentor = req.body.projectMentor;
    const userId = req.body.userId;
    const teamLeaderNickname = req.body.teamLeaderNickname;
    const referral_code = shortid.generate();
    if(!projectName || !projectdescribe){
        return res.status(404).send({message: '請輸入資料!'})
    }
    const createdProject = await Project.create({
        name: projectName,
        describe: projectdescribe,
        mentor: projectMentor,
        referral_code: referral_code,
        currentStage:1,
        currentSubStage:1,
        ProjectEnd:false,
        teamLeader: userId, // Add the teamLeader field
        teamLeaderNickname:teamLeaderNickname
    });

    const creater = await User.findByPk(userId);
    const userProjectAssociations = await createdProject.addUser(creater);

    //initailize kanban
    const kanban = await Kanban.create({column:[], projectId:createdProject.id});
    // const todo = await Column.create({name:"思考歷程鷹架", task:[], kanbanId:kanban.id});
    const inProgress = await Column.create({name:"進行中", task:[], kanbanId:kanban.id});
    const Completed = await Column.create({name:"完成", task:[], kanbanId:kanban.id});
    await Kanban.findByPk(kanban.id)
    .then(kanban =>{
        kanban.column = [inProgress.id, Completed.id ];
        return kanban.save();
    })
    // .then(kanban =>{
    //     kanban.column = [todo.id, inProgress.id, Completed.id ];
    //     return kanban.save();
    // })
    .catch(err => console.log(err));

    await Idea_wall.create({
        type:"project",
        projectId:createdProject.id,
        stage:`${createdProject.currentStage}-${createdProject.currentSubStage}`
    })
    .then(() =>{
        res.status(200).send({message: '活動創建成功!'})
    })
    .catch(err => console.log(err));

    //initailize process
    const process = await Process.create({
        stage:[],
        projectId:createdProject.id
    });
    const stage1 = await Stage.create({
        name:"同理",
        sub_stage:[],
        processId:process.id
    });
    const stage2 = await Stage.create({
        name:"定義",
        sub_stage:[],
        processId:process.id
    });
    const stage3 = await Stage.create({
        name:"發想",
        sub_stage:[],
        processId:process.id
    });
    const stage4 = await Stage.create({
        name:"原型",
        sub_stage:[],
        processId:process.id
    });
    const stage5 = await Stage.create({
        name:"測試",
        sub_stage:[],
        processId:process.id
    });

    await Process.findByPk(process.id)
    .then(process =>{
        process.stage = [stage1.id, stage2.id, stage3.id, stage4.id, stage5.id];
        return process.save();
    })
    .catch(err => console.log(err));

    const sub_stage_1_1 = await Sub_stage.create({
        name:"經驗分享與同理",
        description:"在 1-1 的階段中，回想自身經驗，或是身邊的人是否有同樣例子，並提供完整資訊分享給同組的夥伴，並再與小組討論完後，將想法張貼至想法牆中!",
        userSubmit:{
            "發想主題":"input",
            "附加檔案":"file",
            // "原因":"textarea",
        },
        stageId:stage1.id
    })
    const sub_stage_1_2 = await Sub_stage.create({
        name:"定義利害關係人",
        description:"根據剛剛所發散的想法，和組員討論並歸納出利害關係人，並定義利害關係人為哪些人?",
        userSubmit:{
            "利害關係人":"input",
            // "附加檔案":"file",
            // "內容":"textarea",
        },
        stageId:stage1.id
    });
    const sub_stage_1_3 = await Sub_stage.create({
        name:"進場域前的同理",
        description:"進入相關場域訪談前，必須先廣泛思考利害關係人可能遇到的問題，並和小組討論過後，再接續得出訪談的問題種類。",
        userSubmit:{
            "列出問題":"input",
            "附加檔案":"file",
            // "內容":"textarea",
        },
        stageId:stage1.id
    });
    const sub_stage_1_4 = await Sub_stage.create({
        name:"歸類需求與問題",
        description:"待實際場域訪談後，將所記錄的資料進行彙整並張貼至想法牆中，並和小組討論以歸納利害關係人所遇到的問題。",
        userSubmit:{
            "成果標題":"input",
            "附加檔案":"file",
            "內容":"textarea",
        },
        stageId:stage1.id
    });
    await Stage.findByPk(stage1.id)
    .then(stage1 =>{
        stage1.sub_stage = [sub_stage_1_1.id, sub_stage_1_2.id ,sub_stage_1_3.id,sub_stage_1_4.id];
        return stage1.save();
    })
    .catch(err => console.log(err));

    const sub_stage_2_1 = await Sub_stage.create({
        name:"初步統整問題",
        description:"將已張貼至想法牆中的 '利害關係人所遇到的問題' ，進行初步統整與統整歸類。",
        userSubmit:{
            "討論結果(確認問題的有效性和相關性)":"input",
            "附加檔案":"file",
            "內容":"textarea",
        },
        stageId:stage2.id
    });
    const sub_stage_2_2 = await Sub_stage.create({
        name:"定義問題",
        description:"根據上階段所歸類的問題，透過小組討論篩選出真正值得解決的問題，若遲遲無法得到共識，可使用公平的投票方式。",
        userSubmit:{
            "值得解決的問題":"input",
            "附加檔案":"file",
            "內容":"textarea",
        },
        stageId:stage2.id
    });
    // const sub_stage_2_3 = await Sub_stage.create({
    //     name:"設計研究記錄表格",
    //     description:"瀏覽上一階段所訂定研究構想表，與小組討論出合適的紀錄表格。",
    //     userSubmit:{
    //         "紀錄表格":"file"
    //     },
    //     stageId:stage2.id
    // });
    // const sub_stage_2_4 = await Sub_stage.create({
    //     name:"進行嘗試性研究",
    //     description:"請先瀏覽研究構想後，與小組討論嘗試性實驗的結果，紀錄實驗結果。",
    //     userSubmit:{
    //         "研究成果":"input",
    //         "結果說明":"textarea",
    //         "應注意和改進事項":"textarea",
    //         "附加檔案":"file",
    //     },
    //     stageId:stage2.id
    // });

    await Stage.findByPk(stage2.id)
    .then(stage2 =>{
        stage2.sub_stage = [sub_stage_2_1.id, sub_stage_2_2.id];
        return stage2.save();
    })
    .catch(err => console.log(err));

    const sub_stage_3_1 = await Sub_stage.create({
        name:"解決方案發想",
        description:"根據前階段得出的待解決的問題，選定一個問題，並開始發散性思考解決方案，此階段不受限任何想法。",
        userSubmit:{
            "解決方案":"input",
            "附加檔案":"file",
            "內容":"textarea",
        },
        stageId:stage3.id
    });
    const sub_stage_3_2 = await Sub_stage.create({
        name:"篩選與整合方法",
        description:"根據前階段所得的想法中，與小組成員討論，篩選並整合出最適合的解決方案。",
        userSubmit:{
            "整合出的最終解決方案":"input",
            "附加檔案":"file",
            "內容":"textarea",
        },
        stageId:stage3.id
    });
    // const sub_stage_3_3 = await Sub_stage.create({
    //     name:"撰寫研究成果",
    //     description:"請先瀏覽研究構想、實驗日誌與實驗分析後，與小組討論並撰寫成word檔案上傳。",
    //     userSubmit:{
    //         "研究成果":"input",
    //         "結果說明":"textarea",
    //         "應注意和改進事項":"textarea",
    //         "附加檔案":"file",
    //     },
    //     stageId:stage3.id
    // });

    await Stage.findByPk(stage3.id)
    .then(stage3 =>{
        stage3.sub_stage = [sub_stage_3_1.id, sub_stage_3_2.id];
        return stage3.save();
    })
    .catch(err => console.log(err));

    const sub_stage_4_1 = await Sub_stage.create({
        name:"原型製作",
        description:"開始實作原型，此階段可透過Figma、draw.io等等設計工具輔助，用以快速建立原型。",
        userSubmit:{
            "成果":"input",
            "附加檔案":"file",
            "內容":"textarea",
        },
        stageId:stage4.id
    });
    // const sub_stage_4_2 = await Sub_stage.create({
    //     name:"撰寫研究結論",
    //     description:"根據研究結果與研究討論的內容提出可能的研界結論，並與小組成員一同進行討論。",
    //     userSubmit:{
    //         "研究結論":"file",
    //     },
    //     stageId:stage4.id
    // });

    await Stage.findByPk(stage4.id)
    .then(stage4 =>{
        stage4.sub_stage = [sub_stage_4_1.id];
        return stage4.save();
    })
    .catch(err => console.log(err));

    const sub_stage_5_1 = await Sub_stage.create({
        name:"原型測試與分析",
        description:"將產出之原型丟入實際場域進行測試，將蒐集後的資料紀錄於想法牆中，接著旱小組成員討論並分析如何改進。",
        userSubmit:{
            "成果":"input",
            "附加檔案":"file",
            "內容":"textarea",
        },
        stageId:stage5.id
    });
    const sub_stage_5_2 = await Sub_stage.create({
        name:"開始修正",
        description:"根據前階段得出之結果，原型若是不夠完善，則跌代回先前階段，重新跑流程。",
        userSubmit:{
            "成果":"input",
            "附加檔案":"file",
            "內容":"textarea",
        },
        stageId:stage5.id
    });

    await Stage.findByPk(stage5.id)
    .then(stage5 =>{
        stage5.sub_stage = [sub_stage_5_1.id,sub_stage_5_2.id];
        return stage5.save();
    })
    .catch(err => console.log(err));
      
    
}


exports.inviteForProject = async (req, res) => {
    const referral_Code = req.body.referral_Code;
    const userId = req.body.userId;

    console.log('Referral Code:', referral_Code);
    console.log('User ID:', userId);

    if (!referral_Code) {
        console.log('Referral code is missing!');
        return res.status(400).json({ message: '請輸入邀請碼!' });
    }

    try {
        // 查找具有给定邀请码的项目
        const referralProject = await Project.findOne({
            where: {
                referral_code: referral_Code
            }
        });

        // 检查是否找到了项目
        if (!referralProject) {
            console.log('Project not found for referral code:', referral_Code);
            return res.status(404).json({ message: '邀請碼不存在!' });
        }
        console.log("projectId:", referralProject.id); // 添加日志输出
        console.log("userId:", userId); // 添加日志输出
        // 检查用户是否已经存在于项目中
        const userProject = await User_project.findOne({
            where: {
                projectId: referralProject.id,
                userId: userId
            }
            
        });
        console.log("userProject:", userProject); // 添加日志输出

        if (userProject) {
            console.log('User already exists in project!');
            return res.status(400).json({ message: '你已經是此活動的其中一員!' });
        } 

        // 找到用户
        const invitedUser = await User.findByPk(userId);
        if (!invitedUser) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found!' });
        }

        // 将用户加入项目
        await referralProject.addUser(invitedUser);

        console.log('Successfully invited user to project!');
        // 成功邀请用户加入项目
        return res.status(200).json({ 
            message: '成功加入活動!',
            projectId: referralProject.id // 返回项目ID
         });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error!' });
    }
};


exports.updateProject = async (req, res) => {
    const projectId = req.params.projectId; // 从 URL 中获取 projectId
    const { name, describe, mentor } = req.body; // 从请求体中获取其他数据

    try {
        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ message: '项目不存在!' });
        }
        project.name = name;
        project.describe = describe;
        project.mentor = mentor;
        await project.save();
        res.status(200).json({ message: '项目更新成功!', project });
    } catch (error) {
        console.error("更新项目错误:", error);
        res.status(500).json({ message: '内部服务器错误!' });
    }
};


// controllers/project.js
exports.deleteProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ message: '项目不存在!' });
        }
        await project.destroy();
        res.status(200).json({ message: '项目删除成功!' });
    } catch (error) {
        console.error("删除项目错误:", error);
        res.status(500).json({ message: '内部服务器错误!' });
    }
};

exports.getProjectsByMentor = async (req, res) => {
    console.log(req)
    const mentorName = req.params.mentor; // 從 URL 參數中獲取 mentor 名字
    console.log("mentorName:",mentorName)
    try {
        const projects = await Project.findAll({
            where: { mentor: mentorName }
        });

        if (projects.length === 0) {
            return res.status(404).json({ message: '沒有找到該導師的項目' });
        }

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: '內部服務器錯誤' });
    }
};

// exports.inviteForProject = async( req, res) => {
//     const referral_Code = req.body.referral_Code;
//     const userId = req.body.userId;
//     console.log(userId);
//     if(!referral_Code){
//         return res.status(404).send({message: 'please enter referral code!'})
//     }
//     const referralProject = await Project.findOne({
//         where:{
//             referral_code:referral_Code
//         }
//     })
//     const invited = await User.findByPk(userId);
//     const userProjectAssociations = await referralProject.addUser(invited)
//     .then(() => {
//             return res.status(200).send({message: 'invite success!'})
//     })
//     .catch(err => {
//         console.log(err);
//         return res.status(500).send({message: 'invite failed!'})
//     });

// }





// exports.updateProject = async(req, res) => {
//     const projectId = req.body.projectId;
//     const projectName = req.body.projectName;
//     const projectdescribe = req.body.projectdescribe;
//     const projectMentor = req.body.projectMentor;
//     const userId = req.body.userId
//     Project.findByPk(projectId)
//     .then(project =>{
//         if(!project){
//             return res.status(404).json({ message: 'Project not found!' });
//         }
//         project.name = projectName;
//         project.describe = projectdescribe;
//         project.mentor = projectMentor;
//         project.userId = userId;
//         return project.save();
//     })
//     .then(() => {
//         res.status(200).json({message: 'project updated!'});
//     })
//     .catch(err => console.log(err));
// }

// exports.deleteProject = async(req, res) => {
//     const projectId = req.body.projectId;
//     User.findByPk(projectId)
//         .then(project =>{
//             if (!project) {
//                 return res.status(404).json({ message: 'project not found!' });
//             }
//             return User.destroy({
//                 where: {
//                 id: projectId
//                 }
//             });
//         })
//         .then(result => {
//             res.status(200).json({ message: 'project deleted!' });
//         })
//         .catch(err => console.log(err));
// }