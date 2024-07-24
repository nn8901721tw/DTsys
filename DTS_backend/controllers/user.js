const User = require('../models/user');
const Project = require('../models/project');
const bcypt  = require('bcrypt');
const saltRounds = 10;
const {sign} = require('jsonwebtoken');

// Get teachers
exports.getTeachers = (req, res) =>{
    console.log("GET /teachers controller hit~~~~~");
    // Assuming 'role' field distinguishes between users and teachers
    User.findAll({
        where: { role: 'teacher' }
    })
        .then(users =>{
            res.status(200).json({ user: users })
        })
        .catch(err => console.log(err));
}

//get all users
exports.getUsers = (req, res) =>{
    console.log("GET /getUsersgetUsersgetUsersteachers controller hit");
    User.findAll()
        .then(users =>{
            res.status(200).json({ user: users})
        })
        .catch(err => console.log(err));
}

//get user by id
exports.getUser = (req, res) =>{
    const userId = req.params.userId;
    User.findByPk(userId)
        .then(user =>{
            if(!user){
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ user:user });
        })
        .catch(err => console.log(err));
}

// login user
exports.loginUser = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
        User.findAll({
            where:{
                username: username
            }
        })
        .then(result => {
            if(result){
                bcypt.compare(password, result[0].password, (err, response) =>{
                    if(response){
                        const username = result[0].username;
                        const id = result[0].id;
                        const nickname = result[0].nickname;
                        const accessToken = sign(
                                {username: username, id:id}, 
                                "importantsecret"
                        );
                        res.json({accessToken, username, id,nickname});
                    }else{
                        res.status(404).json({message: 'Wrong Username or Password!'});
                        console.log(err);
                    }
                });
            };
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({message: 'Wrong Username or Password!'})
        });
}

// register user
exports.registerUser = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role;
    const nickname = req.body.nickname;
    console.log("Received username:", username);
    console.log("Received password:", password);
    console.log("Received role:", role);

    // 檢查用戶是否已經存在
    User.findOne({
        where: {
            username: username
        }
    })
    .then(existingUser => {
        if (existingUser) {
            // 如果用戶已經存在，返回錯誤信息
            return res.status(400).json({ message: '該用戶已存在，請嘗試其他用戶名稱。' });
        } else {
            // 如果用戶不存在，則創建新用戶
            bcypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ message: '內部錯誤，無法創建新用戶。' });
                } else {
                    User.create({
                        username: username,
                        password: hash,
                        role: role,
                        nickname:nickname
                    })
                    .then(result => {
                        const username = result.username;
                        const id = result.id;
                        const nickname = result.nickname;  // 获取返回的 nickname
                        const accessToken = sign(
                            { username: username, id: id },
                            "importantsecret"
                        );
                        console.log(result);
                        res.status(201).json({ accessToken, username, id , nickname});
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ message: '內部錯誤，無法創建新用戶。' });
                    });
                }
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ message: '內部錯誤，無法查詢用戶信息。' });
    });
}


//update user
// exports.updateUser = (req, res) => {
//     const userId = req.body.userId;
//     const updatedusername = req.body.username;
//     const updatedpassword = req.body.password;
//     bcypt.hash(updatedpassword, saltRounds, (err, hash) => {
//         if(err){
//             console.log(err)
//         };
//         User.findByPk(userId)
//         .then(user => {
//         if (!user) {
//             return res.status(404).json({ message: 'User not found!' });
//         }
//         user.username = updatedusername;
//         user.password = hash;
//         return user.save();
//         })
//         .then(result => {
//         res.status(200).json({message: 'User updated!'});
//         })
//         .catch(err => console.log(err));
//     })
// }

exports.getProjectUsers = async(req, res) => {
    const projectId = req.params.projectId;
    await User.findAll({
        attributes: ['id', 'username', 'nickname'],
        include: [{
            model:Project,
            attributes:[],
            where :{
            id:projectId
        },
        }]
    })
    .then(result =>{
        console.log(result);
        res.status(200).json(result)
    })
    .catch(err => console.log(err));
}

// delete user
// exports.deleteUser = (req, res) => {
//     const userId = req.body.userId;
//     User.findByPk(userId)
//         .then(user => {
//             if (!user) {
//                 return res.status(404).json({ message: 'User not found!' });
//             }
//             return User.destroy({
//                 where: {
//                 id: userId
//                 }
//             });
//         })
//         .then(result => {
//             res.status(200).json({ message: 'User deleted!' });
//         })
//         .catch(err => console.log(err));
// }

