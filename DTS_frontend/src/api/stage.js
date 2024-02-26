import axios from "axios";

const stageApi = axios.create({
    baseURL: "http://localhost:3000/stage",
    headers:{
        "Content-Type":" application/json"
    },
})

export const getSubStage = async (currentStage) => {
    const response = await stageApi.post("/",currentStage )
    return response.data
}