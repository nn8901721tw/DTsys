import React, { useState } from 'react'
import Single from '../../assets/Loby_pic1.png'
import Double from '../../assets/Loby_pic1.png'
import Triple from '../../assets/Loby_pic1.png'
import TopBar from '../../components/TopBar';


import Modal from '../../components/Modal';
import toast, { Toaster } from 'react-hot-toast';
import { GrFormClose } from "react-icons/gr";
import { FaSortDown } from "react-icons/fa";
import { BsBoxArrowInRight } from "react-icons/bs";
import Loader from '../../components/Loader';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { createProject, getAllProject, inviteForProject } from '../../api/project';
import { useNavigate } from 'react-router-dom';
import Pic1 from '../../assets/Loby_pic1.png';


const Cards = () => {

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

    const historyProject = ()=>{
        navigate('/homepage');
    }

  return (
    <div className='min-w-full   '>
        <TopBar />
        <div className='w-full h-screen py-[10rem] 2xl:py-[15rem] lg:py-[10rem] md:py-[9rem] px-4 bg-slate-100'>
            
            <div className=' 2xl:max-w-[1300px] xl:max-w-[1000px] lg:max-w-[900px] md:max-w-[650px] mx-auto grid md:grid-cols-3 justify-items-center'>
                <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300 '>
                    <img className='w-20 mx-auto mt-[-3rem] bg-white' src={Single} alt="/" />
                    <h2 className='text-2xl font-bold text-center py-8'>加入活動</h2>
                    <p className='text-center text-4xl font-bold'>$149</p>
                    {/* <div className='text-center font-medium'>
                        <p className='py-2 border-b mx-8 mt-8'>500 GB Storage</p>
                        <p className='py-2 border-b mx-8'>1 Granted User</p>
                        <p className='py-2 border-b mx-8'>Send up to 2 GB</p>
                    </div> */}
                    <button className='bg-[#00df9a] w-[200px] rounded-md font-medium my-6 mx-auto px-6 py-3' onClick={()=>setInviteProjectModalOpen(true)}>Start Trial</button>
                </div>
                <div className='w-full shadow-xl bg-gray-100 flex flex-col p-4 md:my-0 my-8 rounded-lg hover:scale-105 duration-300'>
                    <img className='w-20 mx-auto mt-[-3rem] bg-transparent' src={Double} alt="/" />
                    <h2 className='text-2xl font-bold text-center py-8'>建立活動</h2>
                    <p className='text-center text-2xl font-bold'>作為組長，帶領各位同學</p>
                    {/* <div className='text-center font-medium'>
                        <p className='py-2 border-b mx-8 mt-8'>500 GB Storage</p>
                        <p className='py-2 border-b mx-8'>1 Granted User</p>
                        <p className='py-2 border-b mx-8'>Send up to 2 GB</p>
                    </div> */}
                    <button className='bg-black text-[#00df9a] w-[200px] rounded-md font-medium mt-12 mx-auto px-6 py-3' onClick={()=>setCreateProjectModalOpen(true)}>Start Trial</button>
                </div>
                <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300'>
                    <img className='w-20 mx-auto mt-[-3rem] bg-white' src={Triple} alt="/" />
                    <h2 className='text-2xl font-bold text-center py-8'>歷史活動</h2>
                    <p className='text-center text-4xl font-bold'>$149</p>
                    {/* <div className='text-center font-medium'>
                        <p className='py-2 border-b mx-8 mt-8'>500 GB Storage</p>
                        <p className='py-2 border-b mx-8'>1 Granted User</p>
                        <p className='py-2 border-b mx-8'>Send up to 2 GB</p>
                    </div> */}
                    <button className='bg-[#00df9a] w-[200px] rounded-md font-medium mt-6 mx-auto px-6 py-3' onClick={historyProject} >Start Trial</button>
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
    
  );
};

export default Cards;