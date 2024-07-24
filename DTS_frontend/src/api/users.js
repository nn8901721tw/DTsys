import axios from "axios";

axios.defaults.withCredentials = true; 
//login & register
const usersApi = axios.create({
    baseURL: "http://localhost:3000/users",
    headers:{
        "Content-Type":" application/json"
    },
})

export const userLogin = async (userdata) => {
    const response = await usersApi.post("/login", userdata)
    return response;
}

export const userRegister = async (userdata) => {
    const response = await usersApi.post("/register", userdata)
    return response;
}

export const  getProjectUser = async (projectId) => {
    const response = await usersApi.get(`/project/${projectId}`)
    return response.data
}

export const getTeachers = async () => {
    const response = await usersApi.get(`/teachers`);
    return response.data;
}