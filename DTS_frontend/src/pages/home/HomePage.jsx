import React, { useState, useEffect } from "react";
import TopBar from "../../components/TopBar";
import SideBar from "../../components/SideBar";
import Modal from "../../components/Modal";
import toast, { Toaster } from "react-hot-toast";
import { GrFormClose } from "react-icons/gr";
import { FaSortDown } from "react-icons/fa";
import { AiFillTool } from "react-icons/ai"; // 引入设置图标
import Swal from "sweetalert2";
import AnimatedDropdown from "./ui/AnimatedDropdown";
import { motion } from "framer-motion";
import Loader from "../../components/Loader";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  createProject,
  getAllProject,
  inviteForProject,
} from "../../api/project";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // 引入返回圖標
import { AiTwotoneTrophy } from "react-icons/ai";
import { updateProject, deleteProject } from "../../api/project"; // 确保正确导入 API 函数

export default function HomePage() {
  const [projectData, setProjectData] = useState([]);
  const [createprojectData, setCreateProjectData] = useState({
    projectMentor: "吳老師",
  });
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState({});

  const [inviteprojectData, setInviteProjectData] = useState({});
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [inviteProjectModalOpen, setInviteProjectModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(localStorage.getItem("nickname"));
  const [hoveredIndex, setHoveredIndex] = useState(null); // 追踪鼠标悬停的卡片索引
  const { isLoading, isError, error, data } = useQuery(
    "projectDatas",
    () => getAllProject({ params: { userId: localStorage.getItem("id") } }),
    { onSuccess: setProjectData }
  );

  const { mutate } = useMutation(createProject, {
    onSuccess: (res) => {
      console.log(res);
      queryClient.invalidateQueries("projectDatas");
      localStorage.setItem("taskSubmitted", "true"); // 设置标志
      sucesssReferralCodeNotify(res.message);
    },
    onError: (error) => {
      console.log(error);
      errorReferralCodeNotify(error.response.data.message);
    },
  });

  const { mutate: referral_CodeMutate } = useMutation(inviteForProject, {
    onSuccess: (res) => {
      console.log(res);
      queryClient.invalidateQueries("projectDatas");
      sucesssReferralCodeNotify(res.message);
    },
    onError: (error) => {
      console.log(error);
      errorReferralCodeNotify(error.response.data.message);
    },
  });
// 处理更新项目
const handleUpdateProject = async () => {
  if (currentProject && currentProject.id) {
    try {
      const updatedData = {
        name: currentProject.name,
        describe: currentProject.describe,
        mentor: currentProject.mentor // 确保mentor字段名称与后端预期一致
      };
      const response = await updateProject(currentProject.id, updatedData);
      console.log("更新成功:", response);
      Swal.fire({
        icon: 'success',
        title: '更新成功！',
        showConfirmButton: true,
        confirmButtonColor: "#0891B2",  // 设置确认按钮颜色


      });
      queryClient.invalidateQueries('projectDatas'); // 重新获取项目列表
      setEditProjectModalOpen(false); // 关闭编辑模态窗口
    } catch (error) {
      console.error("更新失敗:", error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '更新失敗' + error.message
      });
    }
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: '無效'
    });
  }
};

// 处理删除项目
const handleDeleteProject = () => {
  if (currentProject && currentProject.id) {
    Swal.fire({
      title: '確定要刪除此設計思考活動嗎?',
      text: "此操作不可逆!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: "#0891B2",  // 设置确认按钮颜色
      cancelButtonColor: "#c5c8c9",   // 设置取消按钮颜色
      confirmButtonText: '是的, 我要刪除!',
      cancelButtonText: '取消',
      reverseButtons: true,  // 反转按钮位置，使确认按钮在右侧
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProjectMutation.mutate(currentProject.id);
      }
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: '無效'
    });
  }
};

const deleteProjectMutation = useMutation(projectId => {
  console.log("Deleting project with ID:", projectId);
  return deleteProject(projectId);
}, {
onSuccess: () => {
  Swal.fire({
    icon: 'success',
    title: '刪除成功！',
    showConfirmButton: true,
    confirmButtonColor: "#0891B2",  // 设置确认按钮颜色


  });
  queryClient.invalidateQueries("projectDatas");
  setEditProjectModalOpen(false);
},
onError: (error) => {
  console.log("Delete error:", error);
  Swal.fire({
    icon: 'error',
    title: '刪除失敗',
    text: error.response ? error.response.data.message : error.message
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
    referral_CodeMutate(inviteprojectData);
  };

  const errorReferralCodeNotify = (toastContent) => toast.error(toastContent);
  const sucesssReferralCodeNotify = (toastContent) =>
    toast.success(toastContent);

  const backtoLobyPage = () => {
    navigate("/lobypage");
  };

  const handleClick = (projectItem) => {
    Swal.fire({
      title: `確定要進入 ${projectItem.name} 活動?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0891B2",
      cancelButtonColor: "#c5c8c9",
      cancelButtonText: "取消",
      confirmButtonText: "確定",
      reverseButtons: true, // 將取消在左側，確定在右側
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/project/${projectItem.id}/kanban`);
      }
    });
  };

  const containerVariants = {
    hidden: { x: "-100vw" },
    visible: {
      x: 0,
      transition: {
        type: "spring",
        delay: 0.2,
        stiffness: 300,
        duration: 2, // 这里设置动画持续时间，例如1秒
      },
    },
  };
  // 新增的狀態用於追踪選擇的排序方式
  const [sortOrder, setSortOrder] = useState("未完成");

  const handleSortChange = (selectedSortOrder) => {
    setSortOrder(selectedSortOrder);
    let sortedProjects;

    switch (selectedSortOrder) {
      case "已完成":
        sortedProjects = [...projectData].sort(
          (a, b) => b.ProjectEnd - a.ProjectEnd
        );
        break;
      case "未完成":
        sortedProjects = [...projectData].sort(
          (a, b) => a.ProjectEnd - b.ProjectEnd
        );
        break;
      case "依時間":
        sortedProjects = [...projectData].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      default:
        sortedProjects = [...projectData]; // 如果選擇無效，則不進行排序
    }
    setProjectData(sortedProjects);
  };

  useEffect(() => {
    handleSortChange(sortOrder);
  }, [sortOrder]);

  return (
    <div className="min-w-full min-h-screen h-screen overflow-hidden overflow-x-scroll">
      <TopBar />

      <div className="flex flex-col my-5 sm:px-10 md:px-6  py-16 w-full h-screen items-center">
        <div className="flex justify-between w-[65%] ml-24 py-4">
          <h5 className="font-bold text-3xl text-center flex-grow ">
            設計思考活動列表
          </h5>
          <div className="order-last ">
            <AnimatedDropdown handleSortChange={handleSortChange} />
          </div>
        </div>

        {/* <div className=' flex flex-row justify-between items-center w-full sm:w-2/3 my-5'>
          <div className='flex  '>
            
            <button onClick={()=>setCreateProjectModalOpen(true)} className=" bg-customgreen hover:bg-customgreen/80 text-white font-semibold rounded-2xl p-1 mr-1 sm:px-4 sm:mr-4 sm:py-1 text-base">建立專案</button>
            <button onClick={()=>setInviteProjectModalOpen(true)} className=" bg-customgreen hover:bg-customgreen/80 text-white font-semibold rounded-2xl p-1 sm:px-4 sm:py-1 text-base">加入專案</button>
          </div>
          <div className='flex'>
            <span className=' text-sm mr-3 font-bold cursor-pointer'>已開啟</span>
            <span className=' text-sm mr-3 font-bold cursor-pointer'>已關閉</span>
            <span className=' text-sm font-bold cursor-pointer'>日期</span>
            <FaSortDown size={15} className=' cursor-pointer'/>
          </div>
        </div> */}

        {/* <div className="flex justify-center my-6">
          <select
            className="border border-gray-300 rounded-md p-2"
            value={sortOrder}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="未完成">未完成</option>
            <option value="已完成">已完成</option>
            <option value="時間">依時間</option>
          </select>
        </div> */}

        {/* item */}
        <div className="mt-3  w-[75%] 2xl:w-[65%] grid gap-x-4 gap-y-4 sm:gap-x-6 sm:gap-y-4  lg:gap-x-8 lg:gap-y-8  grid-cols-3  mx-auto  content-start h-screen overflow-y-scroll scrollbar-none  scrollbar-thumb-slate-400/70 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
          {isLoading ? (
            <Loader />
          ) : isError ? (
            <p className="font-bold text-2xl">{error.message}</p>
          ) : (
            projectData.map((projectItem, index) => {
              return (
                <motion.div
                  key={index}
                  onMouseEnter={() => setHoveredIndex(index)} // 更改为 onMouseEnter
                  onMouseLeave={() => setHoveredIndex(null)} // 更改为 onMouseLeave
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.1 }} // 添加悬停效果
                  transition={{ type: "spring", stiffness: 1000 }} // 可以调整transition来改变动画效果
                  className={`rounded-lg w-full h-[150px] hover:shadow-2xl ${
                    projectItem.ProjectEnd ? "bg-[#0891B2]" : "bg-[#b1ccce]"
                  } shadow-md duration-150`}
                  // onClick={() => handleClick(projectItem)}
                  style={{ cursor: "pointer" }} // 添加样式改变光标为点击样式
                >
                  {projectItem.teamLeaderNickname === nickname &&
                    hoveredIndex === index && (
                      <AiFillTool
                        className="text-cyan-700 absolute top-7 right-3 font-bold"
                        size={24}
                        onClick={(e) => {
                          e.stopPropagation(); // 防止事件冒泡到卡片的点击事件
                          // Handle settings click
                          setCurrentProject(projectItem); // 设置当前项目数据
                          setEditProjectModalOpen(true); // 打开编辑模态窗口
                        }}
                      />
                    )}
                  {projectItem.ProjectEnd ? (
                    <div className=" flex font-bold text-[#fdfdfd] translate-x-3">
                      <AiTwotoneTrophy className=" translate-y-1" />
                      已完成
                    </div>
                  ) : (
                    <div className=" flex font-bold text-white translate-x-3">
                      未完成
                    </div>
                  )}
                  <div
                    className="flex flex-col w-full h-full justify-center items-center p-4 bg-slate-100 shadow-xl hover:bg-gray-50 transition duration-150 ease-in-out rounded-2xl cursor-pointer"
                    onClick={() => handleClick(projectItem)}
                  >
                    <div className="text-sm md:text-base lg:text-lg font-bold text-gray-800 text-center truncate w-full px-2">
                      {projectItem?.name}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 text-center truncate w-full px-2 py-1">
                      {projectItem?.describe}
                    </div>

                    <div className="flex items-center justify-between w-full pt-2">
                      <div className="text-xs md:text-sm text-gray-500 truncate w-1/2 px-2">
                        {projectItem?.referral_code}
                      </div>
                      {/* <div className="text-xs text-gray-500 font-semibold truncate w-1/2 px-2 text-right">
                        指導老師:{projectItem?.mentor}
                      </div> */}
                      <div className="text-xs text-gray-500 font-semibold truncate w-1/2 px-2 text-right">
                        組長:{projectItem?.teamLeaderNickname}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}

          <motion.div
            key="create_project"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{
              type: "spring",
              stiffness: 300,
              duration: 1, // 控制动画持续时间
              delay: projectData.length * 0.1, // 根据项目数量设置延迟，确保这是最后一个飞入的项目
            }}
            className="rounded-lg w-full max-h-[150px] min-h-[150px] bg-slate-100 shadow-xl duration-150 flex justify-center items-center text-slate-400 text-xl font-bold"
            style={{ cursor: "default" }} // 使光标保持默认样式
            onClick={() => setCreateProjectModalOpen(true)}
          >
            建立專案
          </motion.div>
        </div>
      </div>
      <div
        className="fixed right-20 bottom-12 transform hover:scale-110 transition duration-300"
        onClick={backtoLobyPage}
      >
        <FaArrowLeft
          className="text-white bg-customgreen hover:bg-customgreen-dark rounded-full p-2 shadow-md cursor-pointer"
          size={40}
        />
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
        <div className="flex flex-col p-3">
          <h3 className=" font-bold text-base mb-3">建立專案</h3>
          <p className=" font-bold text-base mb-3">專案名稱</p>
          <input
            className=" rounded w-full mb-3"
            type="text"
            placeholder="專案名稱..."
            name="projectName"
            onChange={handleChange}
            required
          />
          <p className=" font-bold text-base mb-3">專案描述</p>
          <textarea
            className=" rounded  w-full p-1"
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
            className="mx-auto w-full h-7 mb-2 bg-customgray rounded font-bold text-xs sm:text-sm text-black/60 mr-2"
          >
            取消
          </button>
          <button
            onClick={() => {
              handleCreateProject();
              setCreateProjectModalOpen(false);
            }}
            type="submit"
            className="mx-auto w-full h-7 mb-2  rounded font-bold text-xs sm:text-sm text-white"
          >
            儲存
          </button>
        </div>
      </Modal>
      <Modal
        open={inviteProjectModalOpen}
        onClose={() => setInviteProjectModalOpen(false)}
        opacity={true}
        position={"justify-center items-center"}
      >
        <button
          onClick={() => setInviteProjectModalOpen(false)}
          className=" absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200"
        >
          <GrFormClose className=" w-6 h-6" />
        </button>
        <div className="flex flex-col p-3">
          <h3 className=" font-bold text-base mb-3">專案邀請碼</h3>
          <input
            className=" rounded  w-full mb-3 "
            type="text"
            minLength="6"
            placeholder="輸入專案邀請碼..."
            name="referral_Code"
            onChange={handleChangeReferral_Code}
            required
          />
        </div>
        <div className="flex justify-end m-2">
          <button
            onClick={() => {
              handleSubmitReferral_Code();
              setInviteProjectModalOpen(false);
            }}
            className="mx-auto w-1/4 h-7 mb-2 bg-cyan-600 rounded font-bold text-xs sm:text-sm text-white"
            type="submit"
          >
            加入
          </button>
        </div>
      </Modal>

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
        open={editProjectModalOpen}
        onClose={() => setEditProjectModalOpen(false)}
        opacity={true}
        position={"justify-center items-center"}
      >
      <h1 className="font-bold text-2xl mb-3">編輯設計思考活動</h1>
        <div className="flex flex-col p-3">
          <h3 className="font-bold text-base mb-3">活動名稱</h3>
          <input
            className="rounded w-full mb-3"
            type="text"
            placeholder="活動名稱..."
            value={currentProject.name || ""}
            onChange={(e) =>
              setCurrentProject({ ...currentProject, name: e.target.value })
            }
          />
          <h3 className="font-bold text-base mb-3">活動詳情</h3>
          <textarea
            className="rounded w-full mb-3"
            placeholder="活動詳情..."
            value={currentProject.describe || ""}
            onChange={(e) =>
              setCurrentProject({ ...currentProject, describe: e.target.value })
            }
          />
          <select
            value={currentProject.projectMentor || ""}
            onChange={(e) =>
              setCurrentProject({
                ...currentProject,
                projectMentor: e.target.value,
              })
            }
            className="text-base w-full px-4 py-3 rounded-lg bg-white mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="吳老師">吳老師</option>
            {/* 添加其他导师选项 */}
          </select>
          <button
          onClick={() => setEditProjectModalOpen(false)}
          className=" absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200"
        >
          <GrFormClose className=" w-6 h-6" />
        </button>
          <div className="flex justify-between mt-4">
            <button
              className="mx-auto w-full h-9 mb-2 bg-[#ec6755] rounded font-bold text-xs sm:text-sm  text-white mr-2"
              onClick={handleDeleteProject}
            >
              刪除活動
            </button>
            <button
              className="mx-auto w-full h-9  mb-2 bg-cyan-600 rounded font-bold text-xs sm:text-sm  text-white"
              onClick={handleUpdateProject}
            >
              儲存變更
            </button>
          </div>
        </div>
      </Modal>

      <Toaster />
    </div>
  );
}
