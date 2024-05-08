import React, {useState} from 'react';
import { useMutation, useQuery } from 'react-query';
import { submitTask } from '../../api/submit';
import { useNavigate , useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { getSubStage } from '../../api/stage';
import CommonInput from './components/CommonInput';
import Loader from '../../components/Loader';
import { socket } from "../../utils/socket";


export default function SubmitTask() {
    const [ taskData, setTaskData ] = useState({});
    const [ attachFile, setAttachFile ] = useState(null);
    const navigate = useNavigate();
    const {projectId} = useParams();
    const [ stageInfo ,setStageInfo ] = useState({userSubmit:{}});
    const [template, setTemplate] = useState([]);
    
    const {mutate} = useMutation( submitTask, {
        onSuccess : ( res ) =>{
            if(res.message === "done"){
                socket.emit('taskUpdated'); // 廣播任務更新事件
                sucesssNotify("全部階段已完成")
                localStorage.setItem('stageEnd', "true")
            }
            sucesssNotify(res.message)
            localStorage.removeItem("currentStage");
            localStorage.removeItem("currentSubStage");
            socket.emit('taskUpdated'); // 廣播任務更新事件
            socket.emit('taskSubmitted', { projectId: projectId, message: 'Task updated' });
            console.log("taskSubmitted");
            localStorage.setItem('taskSubmitted', 'true'); // 设置标志

            navigate(`/project/${projectId}/kanban`);
        },
        onError : (error) =>{
            console.log(error);
            errorNotify(error.response.data.message)
        }
    })

    const getSubStageQuery = useQuery( "getSubStage", () => getSubStage({
        projectId:projectId,
        currentStage:localStorage.getItem("currentStage"),
        currentSubStage:localStorage.getItem("currentSubStage")
    }), 
    {
        onSuccess: (data)=>{
        setStageInfo(prev => ({
            ...prev,
            ...data,
            currentStage:localStorage.getItem("currentStage"),
            currentSubStage:localStorage.getItem("currentSubStage")
        }));
        },
        enabled:!!projectId
    }
    );

    const handleChange = e =>{
        const { name, value } = e.target;
        const nameArray = Object.keys(stageInfo.userSubmit);
        setTaskData( prev => ({
        ...prev,
        [nameArray[name]]:value, 
        }));
    }
    const handleAddFileChange = e =>{
        setAttachFile(e.target.files); 
    }

    const handleSubmit = e =>{
        e.preventDefault();
        const formData = new FormData();
        formData.append('projectId',projectId);
        formData.append('currentStage',localStorage.getItem('currentStage'));
        formData.append('currentSubStage',localStorage.getItem('currentSubStage'));
        formData.append('content',JSON.stringify(taskData));
        if(attachFile){
            for (let i = 0; i < attachFile.length; i++){
                formData.append("attachFile", attachFile[i]);
            }
        }
        for(let key in taskData){
            formData.append(key, taskData[key]);
        }
        mutate(formData);
    }
    const errorNotify = (toastContent) => toast.error(toastContent);
    const sucesssNotify = (toastContent) => toast.success(toastContent);



    const handleOneClickUse = async () => {
        // 确保有进行中的列 ID
        if (!doingColumnId) {
          console.error("No doingColumnId set");
          return;
        }
    
        // 确保模板数据已加载
        if (!template || template.length === 0) {
          console.error("Template data is not loaded yet");
          return;
        }
    
        try {
          // 遍歷所有模板，為每個模板創建一個新的任務
          if (!doingColumnId) {
            throw new Error("No doingColumnId set");
        }
        if (!template || template.length === 0) {
            throw new Error("Template data is not loaded yet");
        }
    
          const tasksCreationPromises = template.map((scaffoldingItem) => {
            if (!scaffoldingItem || !scaffoldingItem.scaffolding_template) {
              throw new Error("Invalid scaffolding item");
            }
            const newTask = {
              content: scaffoldingItem.scaffolding_template,
              columnId: doingColumnId, // 使用之前找到的進行中的列ID
            };
            // 使用 createTaskAndUpdateColumn 函數發起請求
            return createTaskAndUpdateColumn(newTask);
          });
    
          // 等待所有任務創建操作完成
          const responses = await Promise.all(tasksCreationPromises);
          console.log(
            "All tasks created and column updated:",
            responses.map((res) => res.data)
          );
          const newTasksIds = responses.map((res) => res.data.taskId);
          // 你可能需要在这里通知服务器，比如发送一个socket事件来告知新创建的任务ID
          socket.emit("tasksCreated", {
            columnId: doingColumnId,
            newTasksIds,
            projectId,
          });
    
          // 更新前端狀態或提示用戶
          // ... 這裡可能需要更新前端的 column 狀態，取決於您的實際需求 ...
        } catch (error) {
          console.error("Error in handleOneClickUse:", error);
        }
      };

    return (
        localStorage.getItem('stageEnd') ? 
        <div className='flex my-5 pl-20 pr-5 sm:px-20 py-16 w-full h-screen justify-center items-center'>
            <div className=' text-customgreen text-xl font-bold'>階段皆已完成</div>
        </div>
        :
        <div className='flex flex-col my-5 pl-20 pr-5 sm:px-20 py-16 w-full h-screen justify-center items-center shadow-lg '>
            {
                getSubStageQuery.isLoading ? <Loader/> :
                <div className='flex flex-col w-3/5 p-3 bg-[#F7F6F6] border-2 border-gray-200 rounded-lg shadow-2xl'>
                    <h3 className=' font-extrabold text-2xl text-center mb-3'>
                    {stageInfo.name}
                    </h3>
                    <hr className='w-full h-[3px] rounded-xl bg-gray-200 border-0 dark:bg-gray-700 mb-4'/>
                    {Object.entries(stageInfo.userSubmit).map((element, index) =>{
                        const name = element[0];
                        const type = element[1];
                        switch (type){
                            case "input":
                                return <CommonInput key={index} handleChange={handleChange} type={type} name={name} index={index}/>
                                break;
                            case "file":
                                return <CommonInput key={index} handleChange={handleAddFileChange} type={type} name={name} index={index}/>
                                break;
                            case "textarea":
                                return <CommonInput key={index} handleChange={handleChange} type={type} name={name} index={index}/>
                                break;
                        }
                        
                    })}
                    <div className='flex justify-end '>
                        <button onClick={ e => {handleSubmit(e)}}   
                        className="mx-auto w-full h-9  mb-2 bg-[#7fd4d8] rounded font-bold text-xs sm:text-sm  xl:text-base text-white">
                            上傳
                        </button>
                    </div> 
                </div>
            }
            <Toaster />
        </div>
    )
}
