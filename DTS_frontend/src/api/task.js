import axios from "axios";

const scaffoldingTemplateApi = axios.create({
    baseURL: "http://localhost:3000/task",
    headers:{
        "Content-Type":" application/json"
    },
})



  // 創建任務並更新 column 的API函數
export const createTaskAndUpdateColumn = (newTask) => {
    return scaffoldingTemplateApi.post('/', newTask);
};