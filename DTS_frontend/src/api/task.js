import axios from "axios";

const scaffoldingTemplateApi = axios.create({
    baseURL: "http://140.115.126.47:3000/task",
    headers:{
        "Content-Type":" application/json"
    },
})



  // 創建任務並更新 column 的API函數
export const createTaskAndUpdateColumn = (newTask) => {
    return scaffoldingTemplateApi.post('/', newTask);
};