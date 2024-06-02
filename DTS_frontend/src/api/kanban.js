import axios from "axios";

axios.defaults.withCredentials = true; 
const kanbanApi = axios.create({
    baseURL: "http://140.115.126.47:3000/kanbans",
    headers:{
        "Content-Type":" application/json"
    },
})

export const getKanbanColumns = async (projectId) => {
    const response = await kanbanApi.get(`/${projectId}`)
    return response.data
}

export const getKanbanTasks = async (columnId) => {
    const response = await kanbanApi.get(`/columns/${columnId}`)
    return response.data
}

export const addCardItem = async (cardItem) => {
    const response = await kanbanApi.post("/", cardItem)
}

export const updateCardItem = async (cardItem) => {
    const response = await kanbanApi.put("/", cardItem)
}

export const deleteCardItem = async (config) => {
    const response = await kanbanApi.delete("/",config)
}

export const moveTaskToCompleted = async (taskId, inProgressColumnId, completedColumnId) => {
    // 发送 PUT 请求到后端，携带任务ID和目标列的ID
    const response = await kanbanApi.put(`/move-task`, {
        taskId,
        inProgressColumnId,
        completedColumnId
    });
    return response.data;
}
