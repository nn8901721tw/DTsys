import React, { useState } from "react";
import Single from "../../assets/Loby_pic1.png";
import Double from "../../assets/Loby_pic2.png";
import Triple from "../../assets/Loby_pic3.png";
import TopBar from "../../components/TopBar";
import Swal from "sweetalert2";

import Lottie from "lottie-react";
import owlAnimation from "../../assets/owlAnimation.json";
import Modal from "../../components/Modal";
import toast, { Toaster } from "react-hot-toast";
import { GrFormClose } from "react-icons/gr";
import { FaSortDown } from "react-icons/fa";
import { BsBoxArrowInRight } from "react-icons/bs";
import Loader from "../../components/Loader";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  createProject,
  getAllProject,
  inviteForProject,
} from "../../api/project";
import { useNavigate } from "react-router-dom";
import Pic1 from "../../assets/Loby_pic1.png";
import { TypeAnimation } from "react-type-animation";

const Cards = () => {
  const [projectData, setProjectData] = useState([]);
  const [createprojectData, setCreateProjectData] = useState({
    projectMentor: "吳老師",
  });
  const [inviteprojectData, setInviteProjectData] = useState({});
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [inviteProjectModalOpen, setInviteProjectModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [isHovered3, setIsHovered3] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { isLoading, isError, error, data } = useQuery(
    "projectDatas",
    () => getAllProject({ params: { userId: localStorage.getItem("id") } }),
    { onSuccess: setProjectData }
  );

  const { mutate } = useMutation(createProject, {
    onSuccess: (res) => {
      console.log(res);
      queryClient.invalidateQueries("projectDatas");
      localStorage.setItem('taskSubmitted', 'true'); // 设置标志
      // sucesssReferralCodeNotify(res.message)
      Swal.fire({
        icon: "success",
        title: "成功",
        text: res.message,
        customClass: {
          backdrop: "bg-red-500", // 背景颜色
          popup: "bg-[#F7F6F6]", // 弹出框背景颜色
        },
      });
    },
    onError: (error) => {
      console.log(error);
      // errorReferralCodeNotify(error.response.data.message)
      Swal.fire({
        icon: "error",
        title: "失敗",
        text: error.response.data.message,
        customClass: {
          backdrop: "bg-red-500", // 背景颜色
          popup: "bg-[#F7F6F6]", // 弹出框背景颜色
        },
      });
    },
  });

  const { mutate: referral_CodeMutate } = useMutation(inviteForProject, {
    onSuccess: (res) => {
      console.log(res);
      queryClient.invalidateQueries("projectDatas");
      // 使用SweetAlert2显示成功消息
      Swal.fire({
        icon: "success",
        title: "成功",
        text: res.message,
        customClass: {
          backdrop: "bg-red-500", // 背景颜色
          popup: "bg-[#F7F6F6]", // 弹出框背景颜色
        },
      });
    },
    onError: (error) => {
      console.log(error);
      // 使用SweetAlert2显示错误消息
      Swal.fire({
        icon: "error",
        title: "失敗",
        text: error.response.data.message,
        customClass: {
          backdrop: "bg-red-500", // 背景颜色
          popup: "bg-[#F7F6F6]", // 弹出框背景颜色
        },
      });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCreateProjectData((prev) => ({
      ...prev,
      [name]: value,
      userId: localStorage.getItem("id"),
      teamLeaderNickname: localStorage.getItem("nickname"),
    }));
  };

  const handleCreateProject = () => {
    mutate(createprojectData);
  };

  const handleChangeReferral_Code = (e) => {
    const { name, value } = e.target;
    setInviteProjectData({
      [name]: value,
      userId: localStorage.getItem("id"),
    });
  };

  const handleSubmitReferral_Code = () => {
    referral_CodeMutate(inviteprojectData, {
      onSuccess: (response) => {
        // 假设返回的响应中包含了活动的ID
        const projectId = response.projectId;
        // 使用 navigate 函数跳转到活动页面
        navigate(`/project/${projectId}/kanban`);
        setInviteProjectModalOpen(false);
      },
      onError: (error) => {
        console.error('Failed to join project:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to Join',
          text: error.response ? error.response.data.message : 'Error joining project',
        });
      }
    });
  };
  
  

  const errorReferralCodeNotify = (toastContent) => toast.error(toastContent);
  const sucesssReferralCodeNotify = (toastContent) =>
    toast.success(toastContent);

  const historyProject = () => {
    navigate("/homepage");
  };

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  const handleHover2 = () => {
    setIsHovered2(true);
  };

  const handleMouseLeave2 = () => {
    setIsHovered2(false);
  };
  const handleHover3 = () => {
    setIsHovered3(true);
  };

  const handleMouseLeave3 = () => {
    setIsHovered3(false);
  };
  
  return (
    <div className="min-w-full   ">
      <TopBar />

      <div className="w-full h-screen py-[10rem] 2xl:py-[9rem] lg:py-[6rem] md:py-[8rem] px-4 bg-[#F7F6F6]0">
        <div className="flex justify-center pb-8">
          <h1 className="text-3xl font-semibold">加入或建立設計思考活動!</h1>
        </div>
        <div className=" 2xl:max-w-[1150px] xl:max-w-[1000px] lg:max-w-[900px] md:max-w-[650px] mx-auto grid md:grid-cols-3 gap-4 justify-items-center cursor-pointer">
          
          <div
            className="w-48 h-48 bg-[#B6D2D4] shadow-xl flex flex-col p-4 my-4 mx-10 rounded-2xl hover:scale-105 duration-300 "
            onClick={() => setInviteProjectModalOpen(true)}
            onMouseEnter={handleHover}
            onMouseLeave={handleMouseLeave}
          >
            <img className="w-28 mx-auto my-auto" src={Single} alt="/" />
            <h2 className="w-full text-2xl font-bold text-center py-4 ">加入活動</h2> 
             {/* <p
              className={`text-center text-2xl font-bold mt-12 ${
                isHovered ? "hidden" : "block"
              }`}
            >
              作為組員
            </p> */}
            <p className="text-center text-2xl font-bold mt-12 ">
            {/* <Lottie className="w-36 h-36" animationData={owlAnimation} /> */}
              {isHovered && (
                <TypeAnimation
                  sequence={[
                    "作為組員，協力完成活動",
                    600,
                    "和大家一起腦力激盪 !",
                    600,
                  ]}
                  speed={60}
                  wrapper="span"
                  cursor={true}
                  repeat={Infinity}
                  className="text-2xl"
                />
                
              )}
            </p>
            {/* <div className='text-center font-medium'>
                        <p className='py-2 border-b mx-8 mt-8'>500 GB Storage</p>
                        <p className='py-2 border-b mx-8'>1 Granted User</p>
                        <p className='py-2 border-b mx-8'>Send up to 2 GB</p>
                    </div> */}
          </div>

          <div
            className="w-48 h-48 bg-[#B6D2D4] shadow-xl flex flex-col p-4 my-4 mx-10 rounded-2xl hover:scale-105 duration-300 "
            onClick={() => setCreateProjectModalOpen(true)}
            onMouseEnter={handleHover2}
            onMouseLeave={handleMouseLeave2}
          >
            <img
              className="w-28 mx-auto my-auto bg-transparent"
              src={Double}
              alt="/"
            />
            <h2 className="w-full text-2xl font-bold text-center py-4">建立活動</h2>
            <p className="text-center text-2xl font-bold mt-12 ">
            {/* <Lottie className="w-36 h-36" animationData={owlAnimation} /> */}
              {isHovered2 && (
                <TypeAnimation
                  sequence={[
                    "作為組長，帶領各位同學",
                    600,
                    "和大家一起腦力激盪 !",
                    600,
                  ]}
                  speed={60}
                  wrapper="span"
                  cursor={true}
                  repeat={Infinity}
                  className="text-2xl"
                />
                
              )}
            </p>
            {/* <p className="text-center text-2xl font-bold">
              作為組長，帶領各位同學
            </p> */}
            {/* <div className='text-center font-medium'>
                        <p className='py-2 border-b mx-8 mt-8'>500 GB Storage</p>
                        <p className='py-2 border-b mx-8'>1 Granted User</p>
                        <p className='py-2 border-b mx-8'>Send up to 2 GB</p>
                    </div> */}
            {/* <button className='bg-slate-800 text-[#00df9a] w-[200px] rounded-md font-bold mt-12 mx-auto px-6 py-3' onClick={()=>setCreateProjectModalOpen(true)}>Start Trial</button> */}
          </div>
          <div
            className="w-48 h-48 bg-[#B6D2D4] shadow-xl flex flex-col p-4 my-4 mx-10 rounded-2xl hover:scale-105 duration-300 "
            onClick={historyProject}
            onMouseEnter={handleHover3}
            onMouseLeave={handleMouseLeave3}
          >
            <img className="w-28 mx-auto my-auto bg-transparent" src={Triple} alt="/" />
            <h2 className="w-full text-2xl font-bold text-center py-4">歷史活動</h2>
            <p className="text-center text-2xl font-bold mt-12 ">
            {/* <Lottie className="w-36 h-36" animationData={owlAnimation} /> */}
              {isHovered3 && (
                <TypeAnimation
                  sequence={[
                    "查看所有活動",
                    600,
                    "遍歷設計思考活動!",
                    600,
                  ]}
                  speed={60}
                  wrapper="span"
                  cursor={true}
                  repeat={Infinity}
                  className="text-2xl"
                />
                
              )}
            </p>
            {/* <p className="text-center text-2xl font-bold">查看所有活動</p> */}
            {/* <div className='text-center font-medium'>
                        <p className='py-2 border-b mx-8 mt-8'>500 GB Storage</p>
                        <p className='py-2 border-b mx-8'>1 Granted User</p>
                        <p className='py-2 border-b mx-8'>Send up to 2 GB</p>
                    </div> */}
            {/* <button className='bg-[#00df9a] w-[200px] rounded-md font-bold mt-6 mx-auto px-6 py-3' onClick={historyProject} >Start Trial</button> */}
          </div>
        </div>
      </div>
      <Modal
        open={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        opacity={true}
        position={"justify-center items-center"}
      >
        <button
          onClick={() => setCreateProjectModalOpen(false)}
          className=" absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200"
        >
          <GrFormClose className=" w-6 h-6" />
        </button>
        <div className="flex flex-col p-3 bg-[#F7F6F6]">
          <h3 className=" font-bold text-xl mb-3">創建設計思考活動</h3>
          <p className=" font-bold text-base mb-3">活動名稱</p>
          <input
            className=" rounded outline-none p-1 w-full mb-3 drop-shadow-md "
            type="text"
            placeholder="專案名稱..."
            name="projectName"
            onChange={handleChange}
            required
          />
          <p className=" font-bold text-base mb-3">活動詳情</p>
          <textarea
            className=" rounded outline-none drop-shadow-md  w-full p-1"
            rows={3}
            placeholder="描述名稱"
            name="projectdescribe"
            onChange={handleChange}
          />
          <div className="mt-4">
            <label className="block text-gray-700 text-base">指導老師</label>
            <select
              name="projectMentor"
              onChange={handleChange}
              className=" text-base w-full px-4 py-3 rounded-lg bg-white mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="吳老師">吳老師</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end m-2">
          <button
            onClick={() => setCreateProjectModalOpen(false)}
            className="mx-auto w-full h-9 mb-2 bg-[#c5c8c9] rounded font-bold text-xs sm:text-sm xl:text-base text-black/60 mr-2"
          >
            取消
          </button>
          <button
            onClick={() => {
              handleCreateProject();
              setCreateProjectModalOpen(false);
            }}
            type="submit"
            className="mx-auto w-full h-9  mb-2 bg-cyan-600 rounded font-bold text-xs sm:text-sm  xl:text-base text-white"
          >
            儲存
          </button>
        </div>
      </Modal>
      <Modal
        open={inviteProjectModalOpen}
        onClose={() => setInviteProjectModalOpen(false)}
        opacity={true}
        position={"justify-center items-center "}
      >
        <button
          onClick={() => setInviteProjectModalOpen(false)}
          className=" absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200"
        >
          <GrFormClose className=" w-6 h-6" />
        </button>
        <div className=" p-3 bg-[#F7F6F6] ">
          <h3 className="  font-bold text-xl mb-3 ">設計思考活動</h3>
          <input
            className=" rounded p-1 w-full mb-1  drop-shadow-md"
            type="text"
            minLength="6"
            placeholder="輸入活動邀請碼..."
            name="referral_Code"
            onChange={handleChangeReferral_Code}
            required
          />
        </div>
        <div className="flex justif-center m-2">
          <button
            onClick={() => setInviteProjectModalOpen(false)}
            className="mx-auto w-full 2xl:w-1/3 2xl:-mr-12 h-9 mb-2 bg-[#bdcdce] rounded font-bold text-xs sm:text-sm xl:text-base text-black/60 mr-2"
          >
            取消
          </button>
          <button
            onClick={() => {
              handleSubmitReferral_Code();
              setInviteProjectModalOpen(false);
            }}
            className="mx-auto w-full 2xl:w-1/3 h-9  mb-2 bg-cyan-600 rounded font-bold text-xs sm:text-sm  xl:text-base text-white"
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
