import React, { useState } from 'react'
import Single from '../../assets/Loby_pic1.png'
import Double from '../../assets/Loby_pic1.png'
import Triple from '../../assets/Loby_pic1.png'
import TopBar from '../../components/TopBar';
import Swal from 'sweetalert2';


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
import { TypeAnimation } from 'react-type-animation';



const Cards = () => {

    const [ projectData, setProjectData ] = useState([]);
    const [ createprojectData, setCreateProjectData] = useState({projectMentor:"吳老師"});
    const [ inviteprojectData, setInviteProjectData] = useState({});
    const [ createProjectModalOpen, setCreateProjectModalOpen ] = useState(false);
    const [ inviteProjectModalOpen, setInviteProjectModalOpen ] = useState(false)
    const [isHovered, setIsHovered] = useState(false);
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
        // sucesssReferralCodeNotify(res.message)
        Swal.fire({
          icon: 'success',
          title: '成功',
          text: res.message,
      });
      },
      onError : (error) =>{
        console.log(error);
        // errorReferralCodeNotify(error.response.data.message)
        Swal.fire({
          icon: 'error',
          title: '失敗',
          text: error.response.data.message,
      });
      }
    })
  
    // const {mutate: referral_CodeMutate } = useMutation( inviteForProject, {
    //   onSuccess : ( res ) =>{
    //     console.log(res);
    //     queryClient.invalidateQueries("projectDatas")
    //     sucesssReferralCodeNotify(res.message)
    //   },
    //   onError : (error) =>{
    //     console.log(error);
    //     errorReferralCodeNotify(error.response.data.message)
    //   }
    // })
    const { mutate: referral_CodeMutate } = useMutation(inviteForProject, {
      onSuccess: (res) => {
          console.log(res);
          queryClient.invalidateQueries('projectDatas');
          // 使用SweetAlert2显示成功消息
          Swal.fire({
              icon: 'success',
              title: '成功',
              text: res.data.message,
          });
      },
      onError: (error) => {
          console.log(error);
          // 使用SweetAlert2显示错误消息
          Swal.fire({
              icon: 'error',
              title: '失敗',
              text: error.response.data.message,
          });
      },
  });


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

    const handleHover = () => {
        setIsHovered(true);
      };
    
      const handleMouseLeave = () => {
        setIsHovered(false);
      };

  return (
    <div className='min-w-full   '>
        <TopBar />
        <div className='w-full h-screen py-[10rem] 2xl:py-[19rem] lg:py-[10rem] md:py-[9rem] px-4 bg-[#F7F6F6]0'>
            
            <div className=' 2xl:max-w-[1350px] xl:max-w-[1000px] lg:max-w-[900px] md:max-w-[650px] mx-auto grid md:grid-cols-3 justify-items-center'>
                <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300 ' onMouseEnter={handleHover} onMouseLeave={handleMouseLeave}>
                    <img className='w-20 mx-auto mt-[-3rem] bg-white' src={Single} alt="/" />
                    <h2 className='text-2xl font-bold text-center py-8'>加入活動</h2>
                    <p className={`text-center text-2xl font-bold ${isHovered ? 'hidden' : 'block'}`}>作為組員</p>
                    <p className='text-center text-2xl font-bold'>
                        {isHovered && (
                            <TypeAnimation
                            sequence={[
                                '作為組員，協力完成活動',
                                1500,
                                '和大家一起腦力激盪 !',
                                1500
                            
                            ]}
                            speed={60}
                            wrapper="span"
                            cursor={true}
                            repeat={Infinity}
                            className='text-2xl'
                            />
                        )}
                    </p>
                    {/* <div className='text-center font-medium'>
                        <p className='py-2 border-b mx-8 mt-8'>500 GB Storage</p>
                        <p className='py-2 border-b mx-8'>1 Granted User</p>
                        <p className='py-2 border-b mx-8'>Send up to 2 GB</p>
                    </div> */}
                    <button className='bg-[#8adfc4cb] w-[200px] rounded-md font-bold my-6 mx-auto px-6 py-3' onClick={()=>setInviteProjectModalOpen(true)}>Start Trial</button>
                </div>
                <div className='w-full shadow-xl bg-gray-100 flex flex-col p-4 md:my-0 my-8 rounded-lg hover:scale-105 duration-300 hover-animation'>
                    <img className='w-20 mx-auto mt-[-3rem] bg-transparent' src={Double} alt="/" />
                    <h2 className='text-2xl font-bold text-center py-8'>建立活動</h2>
                    <p className='text-center text-2xl font-bold'>作為組長，帶領各位同學</p>
                    {/* <div className='text-center font-medium'>
                        <p className='py-2 border-b mx-8 mt-8'>500 GB Storage</p>
                        <p className='py-2 border-b mx-8'>1 Granted User</p>
                        <p className='py-2 border-b mx-8'>Send up to 2 GB</p>
                    </div> */}
                    <button className='bg-slate-800 text-[#00df9a] w-[200px] rounded-md font-bold mt-12 mx-auto px-6 py-3' onClick={()=>setCreateProjectModalOpen(true)}>Start Trial</button>
                </div>
                <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300'>
                    <img className='w-20 mx-auto mt-[-3rem] bg-white' src={Triple} alt="/" />
                    <h2 className='text-2xl font-bold text-center py-8'>歷史活動</h2>
                    <p className='text-center text-2xl font-bold'>查看所有活動</p>
                    {/* <div className='text-center font-medium'>
                        <p className='py-2 border-b mx-8 mt-8'>500 GB Storage</p>
                        <p className='py-2 border-b mx-8'>1 Granted User</p>
                        <p className='py-2 border-b mx-8'>Send up to 2 GB</p>
                    </div> */}
                    <button className='bg-[#00df9a] w-[200px] rounded-md font-bold mt-6 mx-auto px-6 py-3' onClick={historyProject} >Start Trial</button>
                </div>
            </div>
        </div>
        <Modal  open={createProjectModalOpen} onClose={() => setCreateProjectModalOpen(false)} opacity={true} position={"justify-center items-center"}  > 
            <button onClick={() => setCreateProjectModalOpen(false)} className=' absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200'>
              <GrFormClose  className=' w-6 h-6'/>
            </button> 
            <div className='flex flex-col p-3 bg-[#F7F6F6]'>
                <h3 className=' font-bold text-xl mb-3'>創建設計思考活動</h3>
                <p className=' font-bold text-base mb-3'>活動名稱</p>
                <input className=" rounded outline-none p-1 w-full mb-3 drop-shadow-md " 
                    type="text" 
                    placeholder="專案名稱..."
                    name='projectName'
                    onChange={handleChange}
                    required
                    />
                <p className=' font-bold text-base mb-3'>活動詳情</p>
                <textarea className=" rounded outline-none drop-shadow-md  w-full p-1" 
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
                  className="mx-auto w-full h-9 mb-2 bg-[#bdcdce] rounded font-bold text-xs sm:text-sm xl:text-base text-black/60 mr-2" >
                    取消
                </button>
                <button onClick={()=>{
                  handleCreateProject();
                  setCreateProjectModalOpen(false);
                  }} 
                  type="submit"
                  className="mx-auto w-full h-9  mb-2 bg-[#7fd4d8] rounded font-bold text-xs sm:text-sm  xl:text-base text-white">
                    儲存
                </button>
                
            </div> 
        </Modal>
        <Modal open={inviteProjectModalOpen} onClose={() => setInviteProjectModalOpen(false)} opacity={true} position={"justify-center items-center "} > 
            <button onClick={() => setInviteProjectModalOpen(false)} className=' absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200'>
              <GrFormClose  className=' w-6 h-6'/>
            </button> 
            <div className=' p-3 bg-[#F7F6F6] '>
                  <h3 className='  font-bold text-xl mb-3 '>設計思考活動</h3>
                  <input className=" rounded p-1 w-full mb-1  drop-shadow-md" 
                      type="text" 
                      minLength="6"
                      placeholder="輸入活動邀請碼..."
                      name='referral_Code'
                      onChange={handleChangeReferral_Code}
                      required
                    />
              </div>
              <div className='flex justif-center m-2'>
                <button 
                    onClick={() => setInviteProjectModalOpen(false)} 
                    className="mx-auto w-full 2xl:w-1/3 2xl:-mr-12 h-9 mb-2 bg-[#bdcdce] rounded font-bold text-xs sm:text-sm xl:text-base text-black/60 mr-2" >
                      取消
                  </button>
                  <button onClick={()=>{
                    handleSubmitReferral_Code();
                    setInviteProjectModalOpen(false);
                    }} 
                    className="mx-auto w-full 2xl:w-1/3 h-9  mb-2 bg-[#7fd4d8] rounded font-bold text-xs sm:text-sm  xl:text-base text-white"
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