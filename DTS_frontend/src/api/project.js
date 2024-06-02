import axios from "axios";

const projectApi = axios.create({
<<<<<<< HEAD
    baseURL:"http://localhost:3000/projects",
=======
    baseURL: "http://140.115.126.47:3000/projects",
>>>>>>> origin/virtual
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