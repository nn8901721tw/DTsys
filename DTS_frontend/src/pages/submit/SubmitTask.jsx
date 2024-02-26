import React, {useState} from 'react';
import { useMutation, useQuery } from 'react-query';
import { submitTask } from '../../api/submit';
import { useNavigate , useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { getSubStage } from '../../api/stage';
import CommonInput from './components/CommonInput';
import Loader from '../../components/Loader';

export default function SubmitTask() {
    const [ taskData, setTaskData ] = useState({});
    const [ attachFile, setAttachFile ] = useState(null);
    const navigate = useNavigate();
    const {projectId} = useParams();
    const [ stageInfo ,setStageInfo ] = useState({userSubmit:{}});

    const {mutate} = useMutation( submitTask, {
        onSuccess : ( res ) =>{
            if(res.message === "done"){
                sucesssNotify("全部階段已完成")
                localStorage.setItem('stageEnd', "true")
            }
            sucesssNotify(res.message)
            localStorage.removeItem("currentStage");
            localStorage.removeItem("currentSubStage");
            navigate(`/project/${projectId}/kanban`)
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
                formData.append("attachFile", attachFile[i])
            }
        }
        for(let key in taskData){
            formData.append(key, taskData[key]);
        }
        mutate(formData);
    }
    const errorNotify = (toastContent) => toast.error(toastContent);
    const sucesssNotify = (toastContent) => toast.success(toastContent);

    return (
        localStorage.getItem('stageEnd') ? 
        <div className='flex my-5 pl-20 pr-5 sm:px-20 py-16 w-full h-screen justify-center items-center'>
            <div className=' text-customgreen text-xl font-bold'>階段皆已完成</div>
        </div>
        :
        <div className='flex flex-col my-5 pl-20 pr-5 sm:px-20 py-16 w-full h-screen justify-center items-center'>
            {
                getSubStageQuery.isLoading ? <Loader/> :
                <div className='flex flex-col w-1/3 p-3 bg-white border-2 border-gray-200 rounded-lg'>
                    <h3 className=' font-bold text-xl text-center mb-3'>
                    {stageInfo.name}
                    </h3>
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
                    <div className='flex justify-end'>
                        <button onClick={ e => {handleSubmit(e)}}   
                        className="mx-auto w-full h-7 my-3 bg-customgreen rounded font-bold text-xs sm:text-sm text-white">
                            上傳
                        </button>
                    </div> 
                </div>
            }
            <Toaster />
        </div>
    )
}
