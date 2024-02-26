import React, { useState } from 'react'
import TopBar from '../../components/TopBar';
import SideBar from '../../components/SideBar';
import Modal from '../../components/Modal';
import toast, { Toaster } from 'react-hot-toast';
import { GrFormClose } from "react-icons/gr";
import { FaSortDown } from "react-icons/fa";
import { BsBoxArrowInRight } from "react-icons/bs";
import Loader from '../../components/Loader';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { createProject, getAllProject, inviteForProject } from '../../api/project';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [ projectData, setProjectData ] = useState([]);
  const [ createprojectData, setCreateProjectData] = useState({projectMentor:"吳老師"});
  const [ inviteprojectData, setInviteProjectData] = useState({});
  const [ createProjectModalOpen, setCreateProjectModalOpen ] = useState(false);
  const [ inviteProjectModalOpen, setInviteProjectModalOpen ] = useState(false)
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    isLoading,
    isError,
    error,
    data
  } = useQuery( "projectDatas", () => getAllProject(
    {  params: { userId: localStorage.getItem("id") } }), 
    {onSuccess:setProjectData }
  );
  
  const {mutate} = useMutation( createProject, {
    onSuccess : ( res ) =>{
      console.log(res);
      queryClient.invalidateQueries("projectDatas")
      sucesssReferralCodeNotify(res.message)
    },
    onError : (error) =>{
      console.log(error);
      errorReferralCodeNotify(error.response.data.message)
    }
  })

  const {mutate: referral_CodeMutate } = useMutation( inviteForProject, {
    onSuccess : ( res ) =>{
      console.log(res);
      queryClient.invalidateQueries("projectDatas")
      sucesssReferralCodeNotify(res.message)
    },
    onError : (error) =>{
      console.log(error);
      errorReferralCodeNotify(error.response.data.message)
    }
  })

  const handleChange = e =>{
    const { name, value } = e.target;
    setCreateProjectData( prev => ({
        ...prev,
        [name]:value,
        userId:localStorage.getItem("id") 
    }));
  }

  const handleCreateProject = () =>{
    mutate(createprojectData);
  }

  const handleChangeReferral_Code = e =>{
    const { name, value } = e.target;
    setInviteProjectData({
      [name]:value,
      userId:localStorage.getItem("id") 
    })
  }

  const handleSubmitReferral_Code = () =>{
    referral_CodeMutate(inviteprojectData);
  }

  const errorReferralCodeNotify = (toastContent) => toast.error(toastContent);
  const sucesssReferralCodeNotify = (toastContent) => toast.success(toastContent);

  return (
    <div  className='min-w-full min-h-screen h-screen overflow-hidden overflow-x-scroll'>
      <TopBar />
      
      <div className='flex flex-col my-5 pl-20 pr-5 sm:px-20 py-16 w-full h-screen justify-start items-center'>
      <h5>設計思考活動列表</h5>
        <div className=' flex flex-row justify-between items-center w-full sm:w-2/3 mb-5'>
          <div className='flex'>
            
            <button onClick={()=>setCreateProjectModalOpen(true)} className=" bg-customgreen hover:bg-customgreen/80 text-white font-semibold rounded-2xl p-1 mr-1 sm:px-4 sm:mr-4 sm:py-1 text-base">建立專案</button>
            <button onClick={()=>setInviteProjectModalOpen(true)} className=" bg-customgreen hover:bg-customgreen/80 text-white font-semibold rounded-2xl p-1 sm:px-4 sm:py-1 text-base">加入專案</button>
          </div>
          <div className='flex'>
            <span className=' text-sm mr-3 font-bold cursor-pointer'>已開啟</span>
            <span className=' text-sm mr-3 font-bold cursor-pointer'>已關閉</span>
            <span className=' text-sm font-bold cursor-pointer'>日期</span>
            <FaSortDown size={15} className=' cursor-pointer'/>
          </div>
        </div>
        {/* item */}
        <div className='grid gap-4 grid-cols-3 items-center w-full h-screen overflow-hidden overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-400/70 scrollbar-track-slate-200 scrollbar-thumb-rounded-full scrollbar-track-rounded-full'>
          {
            isLoading ? <Loader /> : 
            isError ? <p className='font-bold text-2xl'>{error.message}</p> : 
            projectData.map((projectItem, index) => {
              return (
                <div key={index} className='rounded-lg border-2 w-full sm:w-2/3 min-h-[150px]  bg-white shadow-md'>
                  <div className='flex flex-row w-full h-full'>
                    <div className='flex-1 text-lg font-bold text-center py-3'>{projectItem?.name}</div> 
                    <div className='flex-1 text-lg font-bold text-center py-3'>{projectItem?.describe}</div>
                    <div className='flex-1 flex justify-center items-center py-3'>
                      <BsBoxArrowInRight size={30} className='cursor-pointer text-blue-500 hover:text-blue-700' onClick={() => {navigate(`/project/${projectItem.id}/kanban`)}}/>
                    </div> 
                  </div>
                </div>
              )
            })
          }
          <div className='flex justify-center items-center rounded-lg border-[5px] w-full sm:w-2/3 min-h-[100px] mt-3 bg-white text-slate-400 text-xl font-bold shadow-md'>
            建立新專案
          </div>
        </div>

      </div> 
      <Modal open={createProjectModalOpen} onClose={() => setCreateProjectModalOpen(false)} opacity={true} position={"justify-center items-center"}> 
          <button onClick={() => setCreateProjectModalOpen(false)} className=' absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200'>
            <GrFormClose  className=' w-6 h-6'/>
          </button> 
          <div className='flex flex-col p-3'>
              <h3 className=' font-bold text-base mb-3'>建立專案</h3>
              <p className=' font-bold text-base mb-3'>專案名稱</p>
              <input className=" rounded outline-none ring-2 p-1 ring-customgreen w-full mb-3" 
                  type="text" 
                  placeholder="專案名稱..."
                  name='projectName'
                  onChange={handleChange}
                  required
                  />
              <p className=' font-bold text-base mb-3'>專案描述</p>
              <textarea className=" rounded outline-none ring-2 ring-customgreen w-full p-1" 
                  rows={3} 
                  placeholder="描述名稱" 
                  name='projectdescribe'
                  onChange={handleChange}
                  />
              <div className="mt-4">
                  <label className="block text-gray-700 text-base">指導老師</label>
                  <select name="projectMentor" onChange={handleChange} className=" text-base w-full px-4 py-3 rounded-lg bg-white mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none">
                      <option value="吳老師">吳老師</option>
                  </select>
              </div> 
          </div>
          <div className='flex justify-end m-2'>
              <button 
                onClick={() => setCreateProjectModalOpen(false)} 
                className="mx-auto w-full h-7 mb-2 bg-customgray rounded font-bold text-xs sm:text-sm text-black/60 mr-2" >
                  取消
              </button>
              <button onClick={()=>{
                handleCreateProject();
                setCreateProjectModalOpen(false);
                }} 
                type="submit"
                className="mx-auto w-full h-7 mb-2 bg-customgreen rounded font-bold text-xs sm:text-sm text-white">
                  儲存
              </button>
              
          </div> 
      </Modal>
      <Modal open={inviteProjectModalOpen} onClose={() => setInviteProjectModalOpen(false)} opacity={true} position={"justify-center items-center"}> 
          <button onClick={() => setInviteProjectModalOpen(false)} className=' absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200'>
            <GrFormClose  className=' w-6 h-6'/>
          </button> 
          <div className='flex flex-col p-3'>
                <h3 className=' font-bold text-base mb-3'>專案邀請碼</h3>
                <input className=" rounded outline-none ring-2 p-1 ring-customgreen w-full mb-3 " 
                    type="text" 
                    minLength="6"
                    placeholder="輸入專案邀請碼..."
                    name='referral_Code'
                    onChange={handleChangeReferral_Code}
                    required
                  />
            </div>
            <div className='flex justify-end m-2'>
                <button onClick={()=>{
                  handleSubmitReferral_Code();
                  setInviteProjectModalOpen(false);
                  }} 
                  className="mx-auto w-1/4 h-7 mb-2 bg-customgreen rounded font-bold text-xs sm:text-sm text-white"
                  type="submit"
                  >
                    加入
                </button>
                
            </div> 
      </Modal>
      <Toaster />
    </div>
  )
}

