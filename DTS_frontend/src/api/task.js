import axios from "axios";

const scaffoldingTemplateApi = axios.create({
    baseURL: "http://localhost:3000/task",
    headers:{
        "Content-Type":" application/json"
    },
})

export const createTask = (newTask) => {
    return scaffoldingTemplateApi.post('/', newTask);
  };