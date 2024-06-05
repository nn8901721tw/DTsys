import axios from "axios";

const projectApi = axios.create({
    baseURL:"http://localhost:3000/projects",
    headers:{
        "Content-Type":" application/json",
    },
})

export const getProject = async (projectId) => {
    const response = await projectApi.get(`/${projectId}`)
    return response.data
}

export const getAllProject = async (config) => {
    const response = await projectApi.get("/",config)
    return response.data
}

export const createProject = async (data) => {
    const response = await projectApi.post("/", data)
    return response.data
}

export const inviteForProject = async (data) => {
    const response = await projectApi.post("/referral", data)
    return response.data
}

export const updateProject = async (projectId, data) => {
    try {
        const response = await projectApi.put(`/${projectId}`, data);
        return response.data;
    } catch (error) {
        console.error("更新项目错误:", error);
        throw error;
    }
}

export const deleteProject = async (projectId) => {
    try {
        const response = await projectApi.delete(`/${projectId}`);
        return response.data;
    } catch (error) {
        console.error("删除项目错误:", error);
        throw error;
    }
}

