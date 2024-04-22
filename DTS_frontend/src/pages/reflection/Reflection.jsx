import React, { useState } from "react";
import Modal from "../../components/Modal";
import { GrFormClose } from "react-icons/gr";
import { useParams } from "react-router-dom";
import {
  getAllPersonalDaily,
  createPersonalDaily,
  getAllTeamDaily,
  createTeamDaily,
} from "../../api/reflection";
import { useQuery, useMutation, useQueryClient } from "react-query";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../../components/Loader";
import { motion } from "framer-motion";
import { socket } from "../../utils/socket";

export default function Reflection() {
  const { projectId } = useParams();
  const [personalDaily, setPersonalDaily] = useState([]);
  const [teamDaily, setTeamDaily] = useState([]);
  const [dailyData, setDailyData] = useState({});
  const [attachFile, setAttachFile] = useState(null);
  const [selectedDaily, setSelectedDaily] = useState({
    title: "",
    content: "",
  });
  const [inspectDailyModalOpen, setInspectDailyModalOpen] = useState(false);
  const [personalDailyModalOpen, setPersonalDailyModalOpen] = useState(false);
  const [teamDailyModalOpen, setTeamDailyModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isLoading, isError, error } = useQuery(
    "personalDaily",
    () =>
      getAllPersonalDaily({
        params: { userId: localStorage.getItem("id"), projectId: projectId },
      }),
    {
      onSuccess: setPersonalDaily,
      enabled: !!projectId,
    }
  );

  const teamDailyQuery = useQuery({
    queryKey: ["teamDaily"],
    queryFn: () => getAllTeamDaily({ params: { projectId: projectId } }),
    onSuccess: setTeamDaily,
    enabled: !!projectId,
  });

  const { mutate } = useMutation(createPersonalDaily, {
    onSuccess: (res) => {
      console.log(res);
      queryClient.invalidateQueries("personalDaily");
      sucesssNotify(res.message);
    },
    onError: (error) => {
      console.log(error);
      errorNotify(error.response.data.message);
    },
  });

  const { mutate: teamDailyMutate } = useMutation(createTeamDaily, {
    onSuccess: (res) => {
      console.log(res);
      queryClient.invalidateQueries(["teamDaily"]);
      sucesssNotify(res.message);
    },
    onError: (error) => {
      console.log(error);
      errorNotify(error.response.data.message);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDailyData((prev) => ({
      ...prev,
      [name]: value,
      userId: localStorage.getItem("id"),
    }));
  };
  const handleAddFileChange = (e) => {
    setAttachFile(e.target.files);
  };
  const handleCreatePersonalDaily = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("projectId", projectId);
    if (attachFile) {
      for (let i = 0; i < attachFile.length; i++) {
        formData.append("attachFile", attachFile[i]);
      }
    }
    for (let key in dailyData) {
      formData.append(key, dailyData[key]);
    }
    console.log(...formData);
    mutate(formData);
  };
  const handleChangeSelectDaily = (e) => {
    const { name, value } = e.target;
    setSelectedDaily((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeamDailyChange = (e) => {
    const { name, value } = e.target;
    setDailyData((prev) => ({
      ...prev,
      [name]: value,
      userId: localStorage.getItem("id"),
    }));
  };

  const handleCreateTeamDaily = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("projectId", projectId);
    if (attachFile) {
      for (let i = 0; i < attachFile.length; i++) {
        formData.append("attachFile", attachFile[i]);
      }
    }
    for (let key in dailyData) {
      formData.append(key, dailyData[key]);
    }
    console.log(...formData);
   // 发送表单数据到后端
   teamDailyMutate(formData, {
    onSuccess: () => {
        // 成功后，发送 socket 事件
        socket.emit("createTeamDaily", { projectId, formData: dailyData });
    }
});
  };

  const errorNotify = (toastContent) => toast.error(toastContent);
  const sucesssNotify = (toastContent) => toast.success(toastContent);

  const cardVariants = {
    initial: {
      opacity: 0,
      y: 50,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
    whileHover: {
      scale: 1.02,
      transition: { duration: 0.3 },
    },
    hover: {
      x: [0, -2, 2, -2, 2, 0],
      transition: { repeat: Infinity, repeatType: "reverse", duration: 0.2 },
    },
  };

  const bigstagesMap = {
    "1": "同理",
    "2": "定義",
    "3": "發想",
    "4": "原型",
    "5": "測試",
  };

  const stagesMap = {
    "1-1": "經驗分享與同理",
    "1-2": "定義利害關係人",
    "1-3": "進場域前的同理",
    "1-4": "歸類需求與問題",
    "2-1": "初步統整問題",
    "2-2": "定義問題",
    "3-1": "問題聚焦",
    "3-2": "篩選與整合方法",
    "4-1": "原型製作",
    "5-1": "原型測試與分析",
    "5-2": "開始修正",
  };

  return (
    <div className="min-w-full min-h-screen h-screen">
      <div className="flex flex-col my-5 pl-28 pr-10 py-11 w-full h-screen justify-start items-start">
        <h3 className="text-2xl ml-4 mt-3 font-bold text-orange-900">個人日誌</h3>
        <hr className="w-full h-[5px] my-2 rounded-xl bg-gray-200 border-0 dark:bg-gray-700" />

        <div className="flex flex-nowrap justify-start items-center w-full mb-5 overflow-x-auto h-44 scrollbar-thin scrollbar-track-teal-700 ">
          <div className="flex mb-3">
            <button
              onClick={() => setPersonalDailyModalOpen(true)}
              className="skew-y-3 bg-teal-500 hover:bg-teal-700 text-white font-semibold rounded-lg p-1 text-base w-[230px] h-[100px] shadow-2xl shadow-teal-400"
            >
              新增日誌
            </button>
          </div>
          {isLoading ? (
            <Loader />
          ) : isError ? (
            <p className="text-base font-bold">{error.message}</p>
          ) : (
            personalDaily.map((item, index) => {
              return (
                <motion.div
                  key={index}
                  className="flex mb-3"
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <button
                    onClick={() => {
                      setInspectDailyModalOpen(true);
                      setSelectedDaily(item);
                    }}
                    className="bg-teal-400 hover:bg-teal-200 text-black font-semibold rounded-2xl text-base skew-y-3 w-[230px] h-[100px] shadow-xl -translate-x-7"
                  >
                    {item.title}
                  </button>
                </motion.div>
              );
            })
          )}
        </div>

        <h3 className="mt-6 text-2xl font-extrabold text-orange-900">小組討論日誌</h3>
        <hr className="w-full h-[5px] rounded-xl bg-gray-200 border-0 dark:bg-gray-700" />

        <div className="flex flex-nowrap justify-start items-center w-full mb-5 overflow-x-auto h-40 scrollbar-thin scrollbar-track-teal-700">
          <div className="flex">
            <button
              onClick={() => {
                setTeamDailyModalOpen(true);
                setDailyData((prev) => ({
                  ...prev,
                  type: "discuss",
                }));
              }}
              className=" skew-y-3 bg-cyan-500 hover:bg-cyan-700 text-white font-semibold rounded-lg text-base w-[230px] h-[100px] shadow-2xl shadow-cyan-400"
            >
              新增日誌
            </button>
            {teamDailyQuery.isLoading ? (
              <Loader />
            ) : teamDailyQuery.isError ? (
              <p className=" text-base font-bold">{error.message}</p>
            ) : (
              teamDaily.map((item, index) => {
                if (item.type === "discuss") {
                  return (
                    <motion.div
                      key={index}
                      className="flex mb-3 "
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                    >
                      <button
                        onClick={() => {
                          setInspectDailyModalOpen(true);
                          setSelectedDaily(item);
                        }}
                        className=" bg-cyan-100 hover:bg-cyan-200 text-black font-semibold rounded-2xl text-base skew-y-3 w-[230px] h-[100px] shadow-xl -translate-x-7"
                      >
                        {item.title}
                      </button>
                    </motion.div>
                  );
                } else return;
              })
            )}
          </div>
        </div>
      </div>
      {/* 個人反思日誌 */}
      <Modal
        open={personalDailyModalOpen}
        onClose={() => setPersonalDailyModalOpen(false)}
        opacity={true}
        position={"justify-center items-center"}
      >
        <button
          onClick={() => setPersonalDailyModalOpen(false)}
          className=" absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200"
        >
          <GrFormClose className=" w-6 h-6" />
        </button>
        <div className="flex flex-col px-1">
          <h3 className=" font-bold text-lg mb-3 text-center">反思日誌</h3>
          {/* <p className=' font-bold text-base '>日誌內容可以撰寫以下項目:</p> */}

          <p className=" font-bold text-base mb-3">設計思考階段 ex: 1-1</p>
          <input
            className=" rounded outline-none  p-1  w-full mb-3"
            type="text"
            placeholder="同理、定義.."
            name="title"
            onChange={handleChange}
            required
          />
          <p className=" font-bold text-base mb-3">日誌內容</p>
          <textarea
            className=" rounded   w-full mb-3 p-1"
            rows={3}
            placeholder=""
            name="content"
            onChange={handleChange}
          />
          <p className=" font-bold text-base mb-3">附加檔案</p>
          <input
            className=" rounded outline-none  p-1  w-full mb-3"
            type="file"
            name="filename"
            onChange={handleAddFileChange}
            multiple
          />
        </div>
        <div className="flex justify-end m-2">
          <button
            onClick={() => setPersonalDailyModalOpen(false)}
            className="mx-auto w-full h-7 mb-2 bg-customgray rounded font-bold text-xs sm:text-sm text-black/60 mr-2"
          >
            取消
          </button>
          <button
            onClick={(e) => {
              handleCreatePersonalDaily(e);
              setPersonalDailyModalOpen(false);
            }}
            type="submit"
            className="mx-auto w-full h-7 mb-2 bg-teal-600 rounded font-bold text-xs sm:text-sm text-white"
          >
            儲存
          </button>
        </div>
      </Modal>
      {/* 小組反思日誌 */}
      <Modal
        open={teamDailyModalOpen}
        onClose={() => setTeamDailyModalOpen(false)}
        opacity={true}
        position={"justify-center items-center"}
      >
        <button
          onClick={() => setTeamDailyModalOpen(false)}
          className=" absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200"
        >
          <GrFormClose className=" w-6 h-6" />
        </button>
        <div className="flex flex-col px-1">
          <h3 className=" font-bold text-lg mb-3 text-center">小組反思日誌</h3>
          {/* <p className=' font-bold text-base '>日誌內容可以撰寫以下項目:</p>
                    <p className=' font-bold text-base '>1.最近完成的進度內容。</p>
                    <p className=' font-bold text-base '>2.完成的完成的心得反思。</p>
                    <p className=' font-bold text-base '>3.下次的預計完成的進度內容。</p>
                    <p className=' font-bold text-base mb-3'> 4.是否遇到新的問題。</p> */}
          <p className=" font-bold text-base mb-3">設計思考階段</p>
          <input
            className=" rounded outline-none p-1 w-full mb-3 shadow-lg"
            type="text"
            placeholder="專案階段 ex:1-1"
            name="stage"
            onChange={handleTeamDailyChange}
            required
          />
          <p className=" font-bold text-base mb-3">設計思考子階段</p>
          <input
            className=" rounded outline-none p-1 w-full mb-3 shadow-lg"
            type="text"
            placeholder="日誌名稱..."
            name="title"
            onChange={handleTeamDailyChange}
            required
          />
          <p className=" font-bold text-base mb-3">子任務內容</p>
          <textarea
            className=" rounded outline-none w-full mb-3 p-1 shadow-lg"
            rows={3}
            placeholder="日誌內容"
            name="content"
            onChange={handleTeamDailyChange}
          />
          <p className=" font-bold text-base mb-3">附加檔案</p>
          <input
            className=" rounded outline-none p-1 w-full mb-3 shadow-lg"
            type="file"
            name="filename"
            onChange={handleAddFileChange}
            multiple
          />
        </div>
        <div className="flex justify-end m-2">
          <button
            onClick={() => setTeamDailyModalOpen(false)}
            className="mx-auto w-full h-7 mb-2 bg-customgray rounded font-bold text-xs sm:text-sm text-black/60 mr-2"
          >
            取消
          </button>
          <button
            onClick={(e) => {
              handleCreateTeamDaily(e);
              setTeamDailyModalOpen(false);
            }}
            type="submit"
            className="mx-auto w-full h-7 mb-2 bg-customgreen rounded font-bold text-xs sm:text-sm text-white"
          >
            儲存
          </button>
        </div>
      </Modal>
      {/* 檢視 */}
      {selectedDaily && (
        <Modal
          open={inspectDailyModalOpen}
          onClose={() => setInspectDailyModalOpen(false)}
          opacity={true}
          position={"justify-center items-center"}
        >
          <div className="flex flex-col p-3">
            <h3 className=" font-bold text-base mb-3">檢視日誌</h3>
            <p className=" font-bold text-base mb-3">標題</p>
            <input
              className=" rounded outline-none ring-2 p-1 ring-customgreen w-full mb-3"
              type="text"
              placeholder="標題"
              name="title"
              value={selectedDaily.title}
              onChange={handleChangeSelectDaily}
            />
            <p className=" font-bold text-base mb-3">內容</p>
            <textarea
              className=" rounded outline-none ring-2 ring-customgreen w-full p-1"
              rows={3}
              placeholder="內容"
              name="content"
              value={selectedDaily.content}
              onChange={handleChangeSelectDaily}
            />
          </div>
          <div className="flex justify-end m-2">
            <button
              onClick={() => setInspectDailyModalOpen(false)}
              className="mx-auto w-1/3 h-7 mb-2 bg-customgreen rounded font-bold text-xs sm:text-base text-white mr-2"
            >
              關閉
            </button>
          </div>
        </Modal>
      )}
      <Toaster />
    </div>
  );
}
