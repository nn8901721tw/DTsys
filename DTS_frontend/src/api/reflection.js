import axios from "axios";

axios.defaults.withCredentials = true; 
const dailyApi = axios.create({
    baseURL: "http://localhost:3000/daily",
    headers:{
        "Content-Type": "multipart/form-data"
    },
})

export const getAllPersonalDaily = async (config) => {
    const response = await dailyApi.get("/",config)
    return response.data
}

export const createPersonalDaily = async (data) => {
    const response = await dailyApi.post("/", data)
    return response.data
}

export const getAllTeamDaily = async (config) => {
    const response = await dailyApi.get("/team",config)
    return response.data
}

export const createTeamDaily = async (config) => {
    const response = await dailyApi.post("/team",config)
    return response.data
}