import axios from "axios";

const scaffoldingTemplateApi = axios.create({
    baseURL: "http://140.115.126.47:3000/getScaffoldingTemplate",
    headers:{
        "Content-Type":" application/json"
    },
})

export const getScaffoldingTemplate = async ({ stage, subStage }) => {
    const response = await scaffoldingTemplateApi.post('/', { stage, subStage });
    return response.data;
  };