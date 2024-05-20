import axios from "axios";

const stageApi = axios.create({
    baseURL: "http://140.115.126.47:3000/stage",
    headers:{
        "Content-Type":" application/json"
    },
})

export const getSubStage = async (currentStage) => {
    const response = await stageApi.post("/",currentStage )
    return response.data
}