import axios from "axios";

const scaffoldingTemplateApi = axios.create({
    baseURL: "http://localhost:3000/getScaffoldingTemplate",
    headers:{
        "Content-Type":" application/json"
    },
})

export const getScaffoldingTemplate = async ({ stage, subStage }) => {
    const response = await scaffoldingTemplateApi.post('/', { stage, subStage });
    return response.data;
  };