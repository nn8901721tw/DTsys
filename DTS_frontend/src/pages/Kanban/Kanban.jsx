import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { FiChevronDown, FiChevronUp, FiCheckCircle } from "react-icons/fi"; // 引入 react-icons 的 Chevron 圖示
import { CSSTransition } from "react-transition-group";
import { v4 as uuidv4 } from "uuid";
import Carditem from "./components/Carditem";
import Carditemtemplate from "./components/Carditem_template";
import TaskHint from "./components/TaskHint";
import Loader from "../../components/Loader";
import OwlquestionFlyoutLink from "./components/OwlquestionFlyoutLink";

import { motion } from "framer-motion";
import { submitTask, getAllSubmit } from "../../api/submit";
import Swal from "sweetalert2";
import Lottie from "lottie-react";
import owlAnimation from "../../assets/owlAnimation1.json";
import question from "../../assets/question.json";
import welldone from "../../assets/welldone.json";
import arrow from "../../assets/arrow.json";
import SlideInNotifications from "./components/SlideInNotifications";
import { DragDropContext } from "react-beautiful-dnd";
import { StrictModeDroppable as Droppable } from "../../utils/StrictModeDroppable";
import { AiFillPushpin } from "react-icons/ai";

import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getKanbanColumns,
  getKanbanTasks,
  addCardItem,
} from "../../api/kanban";
import { getSubStage } from "../../api/stage";
import { createTaskAndUpdateColumn } from "../../api/task";
import { getScaffoldingTemplate } from "../../api/scaffoldingtemplate";
import { socket } from "../../utils/socket";
import SpringModal from "./components/SpringModel"; // 確保從正確的路徑導入 SpringModal

export default function Kanban() {
  const [kanbanData, setKanbanData] = useState([]);
  const [newCard, setNewCard] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedcolumn, setSelectedcolumn] = useState(0);
  const { projectId } = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStagecomplete, setIsStagecomplete] = useState(false);
  const [isPreviousStageIncomplete, setIsPreviousStageIncomplete] =
    useState(false);
  const [isStageIncomplete, setIsStageIncomplete] = useState(false);
  const [stageInfo, setStageInfo] = useState({
    name: "",
    description: "",
  });
  const [notifications, setNotifications] = useState([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showContainer, setShowContainer] = useState(false);
  const [template, setTemplate] = useState([]);
  // 假设上述数据已经是一个状态或从props获取
  const [doingColumnId, setDoingColumnId] = useState(null);

  // 将 currentStage 和 currentSubStage 保存在状态中
  const [currentStage, setCurrentStage] = useState(
    localStorage.getItem("currentStage")
  );
  const [currentSubStage, setCurrentSubStage] = useState(
    localStorage.getItem("currentSubStage")
  );

  const [showFlyout, setShowFlyout] = useState(false);
  const [isAllStagesComplete, setIsAllStagesComplete] = useState(false);

  const {
    isLoading: kanbanIsLoading,
    isError: kanbansIsError,
    error: KanbansError,
    data: KanbansData,
  } = useQuery(["kanbanDatas", projectId], () => getKanbanColumns(projectId), {
    onSuccess: (data) => {
      setKanbanData(data);
      // 假设数据结构是 [{id: 1, ...}, {id: 2, ...}]
      if (data.length > 0) {
        setDoingColumnId(data[0].id);
      }
    },
  });

  const getSubStageQuery = useQuery(
    "getSubStage",
    () =>
      getSubStage({
        projectId: projectId,
        currentStage: localStorage.getItem("currentStage"),
        currentSubStage: localStorage.getItem("currentSubStage"),
      }),
    {
      onSuccess: (data) => {
        setStageInfo((prev) => ({
          ...prev,
          ...data,
          currentStage: localStorage.getItem("currentStage"),
          currentSubStage: localStorage.getItem("currentSubStage"),
        }));
        // setcstage()
      },
      enabled: !!localStorage.getItem("currentStage"),
    }
  );

  const {
    data: templateData,
    isLoading: isLoadingTemplate,
    isError: isErrorTemplate,
  } = useQuery(
    ["scaffoldingTemplate", stageInfo.currentStage, stageInfo.currentSubStage],
    () =>
      getScaffoldingTemplate({
        stage: stageInfo.currentStage,
        subStage: stageInfo.currentSubStage,
      }),
    {
      enabled: !!stageInfo.currentStage && !!stageInfo.currentSubStage,
    }
  );

  // 当从后端获取到新的数据时，更新 template 状态
  useEffect(() => {
    if (templateData) {
      setTemplate(templateData); // 将从后端获取到的数据存入 template 状态中
    }
  }, [templateData]);

  // 当 stageInfo 更新时，重新触发查询
  useEffect(() => {
    queryClient.invalidateQueries([
      "scaffoldingTemplate",
      stageInfo.currentStage,
      stageInfo.currentSubStage,
    ]);
  }, [stageInfo.currentStage, stageInfo.currentSubStage, queryClient]);

  useEffect(() => {

    socket.connect();
    socket.emit("joinProject", projectId);
    function KanbanUpdateEvent(data) {
      if (data) {
        console.log(data);
        queryClient.invalidateQueries(["kanbanDatas", projectId]);
      }
    }
    function kanbanDragEvent(data) {
      if (data) {
        console.log(data);
        setKanbanData(data);
      }
    }

    socket.on("taskItems", KanbanUpdateEvent);
    socket.on("taskItem", KanbanUpdateEvent);
    socket.on("dragtaskItem", kanbanDragEvent);

    return () => {
      socket.off("taskItems", KanbanUpdateEvent);
      socket.off("taskItem", KanbanUpdateEvent);
      socket.off("dragtaskItem", kanbanDragEvent);
      socket.emit("leaveProject", projectId);
      socket.disconnect();
    };
  }, [socket, projectId]);



  //////////////////////
  // useEffect(() => {
  //   if (
  //     !localStorage.getItem("currentStage") ||
  //     !localStorage.getItem("currentSubStage")
  //   ) {
  //     navigate(0, { replace: true });
  //   }
  // }, [
  //   localStorage.getItem("currentStage"),
  //   localStorage.getItem("currentSubStage"),
  // ]);
  /////////////////////////

  useEffect(() => {
    if (!currentStage || !currentSubStage) {
      navigate(0);
    }
  }, [currentStage, currentSubStage, navigate]);

  const onDragEnd = ({ destination, source }) => {
    if (!destination) return;
    if (
      destination.index === source.index &&
      destination.droppableId === source.droppableId
    )
      return;
    socket.emit("cardItemDragged", {
      destination,
      source,
      kanbanData,
      projectId
    });
  };

  const handleChange = (e) => {
    setNewCard(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCard.length === 0) {
      setShowForm(false);
    } else {
      const item = {
        title: "",
        content: newCard,
        labels: [],
        assignees: [],
      };
      // addKanbanMutation.mutate({item})
      socket.emit("taskItemCreated", {
        selectedcolumn,
        item,
        kanbanData,
        projectId,
      });
      setShowForm(false);
      setNewCard("");
    }
  };
  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }, // 定義退出時的動畫效果
  };

  const stages1 = ["同理", "定義", "發想", "原型", "測試"];

  const stages2 = [
    [
      "經驗分享與同理",
      "初步統整問題",
      "問題聚焦",
      "原型製作",
      "原型測試與分析",
    ],
    ["定義利害關係人", "定義問題", "篩選與整合方法", "", "開始修正"],
    ["進場域前的同理", "", "", "", ""],
    ["歸類需求與問題", "", "", "", ""],
  ];
  const stages3 = [
    [
      "在 1-1 的階段中，回想自身經驗，或是身邊的人是否有同樣例子，並提供完整資訊分享給同組的夥伴，並再與小組討論完後，將想法張貼至想法牆中!",
      "問將已張貼至想法牆中的 '利害關係人所遇到的問題' ，進行初步統整與統整歸類。題",
      "根據前階段得出的待解決的問題，選定一個問題，並開始發散性思考解決方案，此階段不受限任何想法。",
      "開始實作原型，此階段可透過Figma、draw.io等等設計工具輔助，用以快速建立原型。",
      "將產出之原型丟入實際場域進行測試，將蒐集後的資料紀錄於想法牆中，接著旱小組成員討論並分析如何改進。",
    ],
    [
      "根據剛剛所發散的想法，和組員討論並歸納出利害關係人，並定義利害關係人為哪些人?",
      "根據上階段所歸類的問題，透過小組討論篩選出真正值得解決的問題，若遲遲無法得到共識，可使用公平的投票方式。",
      "根據前階段所得的想法中，與小組成員討論，篩選並整合出最適合的解決方案。",
      "",
      "根據前階段得出之結果，原型若是不夠完善，則跌代回先前階段，重新跑流程。",
    ],
    [
      "進入相關場域訪談前，必須先廣泛思考利害關係人可能遇到的問題，並和小組討論過後，再接續得出訪談的問題種類。",
      "",
      "",
      "",
      "",
    ],
    [
      "待實際場域訪談後，將所記錄的資料進行彙整並張貼至想法牆中，並和小組討論以歸納利害關係人所遇到的問題。",
      "",
      "",
      "",
      "",
    ],
  ];
  // 檢查是否有當前的階段和子階段
  if (stageInfo.currentStage && stageInfo.currentSubStage) {
    console.log("Current stage:", stageInfo.currentStage);
    console.log("Current substage:", stageInfo.currentSubStage);

    // 在這裡執行根據當前階段和子階段的相應操作
  } else {
    console.log("No current stage or substage found.");
  }

  const handleSubStageClick = (subStageName, stageIndex, subStageIndex) => {
    // 將 stageIndex 和 subStageIndex 進行交換，並對 stageIndex 和 subStageIndex 進行調整
    const correctedStageIndex = subStageIndex + 1;
    const correctedSubStageIndex = stageIndex + 1;

    // 更新 stageInfo 狀態
    setStageInfo((prev) => ({
      ...prev,
      name: subStageName,
      currentStage: `${correctedStageIndex}`,
      currentSubStage: `${correctedSubStageIndex}`,
      description: stages3[stageIndex][subStageIndex],
    }));

    // 提示用戶子階段的編號和敘述已經被更新
    console.log(`子階段編號：${correctedStageIndex}-${correctedSubStageIndex}`);
    console.log(`子階段敘述：${stages3[stageIndex][subStageIndex]}`);

    // 添加以下 console.log 語句
    console.log("currentLocalStorageStage:", currentLocalStorageStage);
    console.log("currentLocalStorageSubStage:", currentLocalStorageSubStage);
    // console.log("stageInfocurrentStage:", correctedStageIndex);
    // console.log("stageInfo.currentSubStage:", correctedSubStageIndex);

    // 檢查是否 currentStage 等於 correctedStageIndex 並且 currentSubStage 大於 correctedSubStageIndex
    const sic =
      correctedStageIndex === currentLocalStorageStage &&
      correctedSubStageIndex > currentLocalStorageSubStage;

    // 檢查是否 correctedStageIndex 大於 currentStage
    const sic2 = parseInt(correctedStageIndex) > currentLocalStorageStage;

    const sic3 =
      correctedStageIndex < currentLocalStorageStage ||
      (correctedStageIndex === currentLocalStorageStage &&
        correctedSubStageIndex < currentLocalStorageSubStage);

    // 設置狀態

    // 設置狀態
    setIsPreviousStageIncomplete(sic2);
    setIsStageIncomplete(sic);
    setIsStagecomplete(sic3);

    console.log("isStageIncomplete:", isStageIncomplete);
    console.log("isPreviousStageIncomplete:", isPreviousStageIncomplete);
  };

  ///////////////////////
  const { mutate } = useMutation(submitTask, {
    onSuccess: (res) => {
      if (res.message === "done") {
        // sucesssNotify("全部階段已完成")
        localStorage.setItem("stageEnd", "true");
      }
      // sucesssNotify(res.message)
      localStorage.removeItem("currentStage");
      localStorage.removeItem("currentSubStage");
      navigate(0);
    },
    onError: (error) => {
      console.log(error);
      errorNotify(error.response.data.message);
    },
  });

  const handleSubmitTask = async (e) => {
    e.preventDefault();

    // // 使用 SweetAlert2 彈出對話框
    // const result = await Swal.fire({
    //   title: "是否完成？",
    //   text: "確定提交此任務嗎？",
    //   icon: "question",
    //   showCancelButton: true,
    //   cancelButtonText: "取消",
    //   confirmButtonText: "確定",
    // });

    // // 如果用戶確定，則問是否有成果要上傳
    // if (result.isConfirmed) {
    const resultUpload = await Swal.fire({
      title: "成果上傳",
      text: "是否有成果要上傳？",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "沒有",
      confirmButtonText: "上傳",
    });

    // 按下取消，則執行提交操作
    // eif (resultUpload.isDismissed) {
    //   const formData = new FormData();
    //   formData.append("projectId", projectId);
    //   formData.append("currentStage", stageInfo.currentStage);
    //   formData.append("currentSubStage", stageInfo.currentSubStage);
    //   formData.append("content", " ");

    //   try {
    //     await mutate(formData);
    //   } catch (error) {
    //     console.error("Error during submission:", error);
    //   }
    // }
    if (resultUpload.isConfirmed) {
      navigate(`/project/${projectId}/submitTask`);
      console.log("進行上傳成果的操作");
    }
    // }
  };

  //////////////////////////

  // 從 localStorage 中獲取當前的階段和子階段
  const currentLocalStorageStage = parseInt(
    localStorage.getItem("currentStage")
  );
  const currentLocalStorageSubStage = parseInt(
    localStorage.getItem("currentSubStage")
  );

  console.log("kanbanData:", kanbanData);
  // console.log("template:", template[0].scaffolding_template);
  console.log("doingColumnId:", doingColumnId);

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
      socket.emit("tasksCreated", { columnId: doingColumnId, newTasksIds,
        projectId });

      // 更新前端狀態或提示用戶
      // ... 這裡可能需要更新前端的 column 狀態，取決於您的實際需求 ...
    } catch (error) {
      console.error("Error creating tasks:", error);
    }
  };
  useEffect(() => {
    const handleColumnUpdate = (updatedColumn) => {
      queryClient.invalidateQueries(["kanbanDatas", projectId]);
    };

    socket.on("columnUpdated", handleColumnUpdate);

    return () => {
      socket.off("columnUpdated", handleColumnUpdate);
    };
  }, [socket, queryClient, projectId]);

  const handleImport = async (scaffoldingItem) => {
    try {
      const response = await createTaskAndUpdateColumn({
        content: scaffoldingItem.scaffolding_template,
        columnId: doingColumnId,
      });
      // 假設 response 是一個物件，且包含 taskId
      console.log(response);
      const newTaskId = response.taskId;
      // 通知服务器新创建的任务ID
      socket.emit("tasksCreated", {
        columnId: doingColumnId,
        taskId: newTaskId,
        projectId:projectId
      });
    } catch (error) {
      console.error("Error importing task:", error);
    }
  };

  useEffect(() => {
    const handleTasksCreated = (data) => {
      const { newTasks } = data;
      setKanbanData((prevData) => {
        // 克隆目前的看板數據
        const newKanbanData = [...prevData];
        // 找到對應的列
        const columnIndex = newKanbanData.findIndex(
          (column) => column.id === data.columnId
        );
        if (columnIndex === -1) return prevData; // 如果找不到列，不進行更新
        // 更新任務列表
        newKanbanData[columnIndex].task = [
          ...newKanbanData[columnIndex].task,
          ...newTasks,
        ];
        return newKanbanData;
      });
    };

    socket.on("tasksCreated", handleTasksCreated);

    return () => {
      socket.off("tasksCreated", handleTasksCreated);
    };
  }, [socket]);


  // 当点击Lottie动画时，调用此函数来添加通知
  const handleLottieClick = () => {
    const newNotification = generateRandomNotif();
    setNotifications((prevNotifications) => [
      newNotification,
      ...prevNotifications,
    ]);
  };

  useEffect(() => {
    const checkAllStagesComplete = async () => {
      try {
        const config = {
          params: { projectId },
        };
        const submits = await getAllSubmit(config);
        const isComplete = submits.some((submit) => submit.stage === "5-2");
        setIsAllStagesComplete(isComplete);
      } catch (error) {
        console.error("Error fetching submits:", error);
      }
    };

    checkAllStagesComplete();
  }, [currentStage, currentSubStage]);

  const handleImageClick = (message) => {
    const newNotification = { id: Math.random(), text: message };
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      newNotification,
    ]);
    setShowFlyout(false); // Immediately close the flyout
    // Optionally clear notification after some time
    setTimeout(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif.id !== newNotification.id)
      );
    }, 5000); // Remove notification after 5 seconds
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <motion.div
        initial="hidden"
        animate={showContainer ? "visible" : "hidden"}
        exit="exit"
        variants={containerVariants}
        transition={{ duration: 0.5 }}
        className="fixed top-16 left-0 right-0 z-10"
        style={{
          opacity: showContainer ? 1 : 0,
          y: showContainer ? 0 : 50,
          visibility: showContainer ? "visible" : "hidden",
        }}
      >
        <div className="transition-all duration-500 transform flex flex-col items-center bg-slate-200 lg:mx-64 xl:mx-80 rounded-2xl opacity-100 scale-y-100 text-gray-700">
          <div className="wrapper">
            <div className="flex font-bold text-lg pt-1 ">階段</div>
          </div>

          <div className="wrapper flex flex-row">
            {stages1.map((subStage, index) => (
              <div key={index} className="flex justify-center pt-1 ">
                <React.Fragment>
                  {index !== 0 && (
                    <hr className="border-solid border-t-8 w-6 items-center justify-center my-auto border-[#C4D8D9]" />
                  )}
                  <div
                    className={`relative px-3 w-32 rounded-md h-14  text-xl font-bold text-center flex items-center justify-center ${
                      parseInt(stageInfo.currentStage) === index + 1
                        ? "bg-[#5698a0] animate-none text-white"
                        : currentLocalStorageStage > index + 1
                        ? "bg-[#5d92a7] text-white"
                        : "bg-[#c4cfcf]"
                    }`}
                  >
                    {currentLocalStorageStage > index + 1 && (
                      <FiCheckCircle className="absolute top-1 right-1 text-sky-100" />
                    )}
                    {subStage}
                  </div>
                </React.Fragment>
              </div>
            ))}
          </div>
          <div className="wrapper">
            <div className="flex font-bold text-lg pt-1">子階段</div>
          </div>
          <div className="wrapper flex flex-col">
            {stages2.map((stage, stageIndex) => (
              <div
                key={stageIndex}
                className="flex flex-row justify-center pt-1"
              >
                {stage.map((subStage, subStageIndex) => (
                  <React.Fragment key={subStageIndex}>
                    {subStageIndex !== 0 && (
                      <hr className="border-solid border-t-8 w-6 items-center justify-center my-auto border-[#E2E8F0]" />
                    )}
                    {subStage ? (
                      <div
                        className={`relative px-3 w-32  rounded-md h-12 text-sm font-bold text-gray-700 text-center flex items-center justify-center cursor-pointer ${
                          stageInfo.name === subStage
                            ? "bg-[#5698a0] animate-bounce text-white"
                            : currentLocalStorageStage > subStageIndex + 1 ||
                              (currentLocalStorageStage === subStageIndex + 1 &&
                                currentLocalStorageSubStage > stageIndex &&
                                currentLocalStorageSubStage !== stageIndex + 1)
                            ? "bg-[#5d92a7] text-white"
                            : "bg-[#c4cfcf]"
                        }`}
                        onClick={() =>
                          handleSubStageClick(
                            subStage,
                            stageIndex,
                            subStageIndex
                          )
                        }
                      >
                        {(currentLocalStorageStage > subStageIndex + 1 ||
                          (currentLocalStorageStage === subStageIndex + 1 &&
                            currentLocalStorageSubStage > stageIndex &&
                            currentLocalStorageSubStage !==
                              stageIndex + 1)) && (
                          <FiCheckCircle className="absolute top-1 right-1 text-sky-100" />
                        )}
                        {subStage}
                      </div>
                    ) : (
                      <div className=" px-3 w-32  rounded-md h-12  text-sm font-bold text-white text-center flex items-center justify-center bg-[#E2E8F0] cursor-default ">
                        {subStage}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>

          <div className="wrapper">
            <div className="bg-slate-200 flex justify-center w-full">
              <button
                className="ml-2 hover:text-gray-700 focus:outline-none transition ease-in-out delay-150 hover:-translate-y-3 hover:scale-150  duration-300"
                onClick={() => setShowContainer(!showContainer)}
              >
                <FiChevronUp className=" animate-bounce w-5 h-5 " />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-row justify-center mx-auto bg-slate-100 px-24 pt-20 mt-2 ">
        <div className="wrapper flex flex-row">
          {stages1.map((subStage, index) => (
            <div key={index} className="flex justify-center pt-1 ">
              <React.Fragment>
                {index !== 0 && (
                  <hr className="border-solid border-t-8 w-6 items-center justify-center my-auto border-[#C4D8D9]" />
                )}
                <div
                  className={`px-3 w-32 rounded-md h-14  text-xl font-bold text-white text-center flex items-center justify-center ${
                    parseInt(stageInfo.currentStage) === index + 1
                      ? "bg-[#5698a0]"
                      : "bg-[#c4cfcf]"
                  }`}
                >
                  {subStage}
                </div>
              </React.Fragment>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-100 flex items-center justify-center">
        <button
          className=" transition ease-in-out delay-150 hover:translate-y-2 hover:scale-125  duration-300"
          onClick={() => {
            setShowContainer(true); // 新增的部分
          }}
        >
          <FiChevronDown className="w-5 h-5 " />
        </button>
      </div>
      <div className="flex justify-end bg-slate-100 pr-44 -mt-7">
        <button
          className={`text-sm font-bold transition delay-150 duration-300 px-4 py-2 rounded-md ${
            isPreviousStageIncomplete ||
            isStageIncomplete ||
            isStagecomplete ||
            isAllStagesComplete // 新增 isStagecomplete 到條件中
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-teal-600 hover:-translate-y-1 hover:scale-110 hover:bg-teal-700 text-white"
          }`}
          onClick={handleSubmitTask}
          disabled={
            isPreviousStageIncomplete ||
            isStageIncomplete ||
            isStagecomplete ||
            isAllStagesComplete
          } // 根據 isStagecomplete 設置 disabled
        >
          {isPreviousStageIncomplete || isStageIncomplete
            ? "請完成先前階段"
            : isAllStagesComplete
            ? "所有階段皆完成!"
            : isStagecomplete
            ? "已完成"
            : "完成此階段"}
        </button>
      </div>
      <SlideInNotifications
        notifications={notifications}
        setNotifications={setNotifications}
        // className="absolute bottom-0 left-0 flex flex-col gap-1 w-72 mb-10 ml-10 z-50 pointer-events-none"
      />
      <div className="grid grid-cols-4 gap-5  px-44 pt-2  min-w-[800px] h-screen overflow-hidden bg-slate-100  ">
        <div className="flex flex-col">
          <AiFillPushpin className="translate-y-4 -mt-4 text-[#355ca5] w-7 h-5" />
          <TaskHint className="" stageInfo={stageInfo} />

          {isAllStagesComplete ? (
            <Lottie
              className="w-50 h-48 z-0 -translate-x-16 "
              animationData={welldone}
            />
          ) : (
            <div
              onMouseEnter={() => setShowFlyout(true)}
              onMouseLeave={() => setShowFlyout(false)}
              className="flex"
              onClick={handleLottieClick} // Define handleLottieClick if it has specific functionality
            >
              <Lottie
                className="w-50 h-40 z-0 scale-x-[-1] -translate-x-32 "
                animationData={owlAnimation}
              />
              <Lottie
                className="wh-16 h-16 z-0 -translate-x-32 "
                animationData={question}
                loop={false} // Stop looping
                autoplay={true} // Automatically start playing
              />
              {showFlyout && (
                <OwlquestionFlyoutLink onImageClick={handleImageClick} />
              )}
            </div>
          )}
        </div>

        {kanbanIsLoading ? (
          <Loader />
        ) : kanbansIsError ? (
          <p className="font-bold text-4xl">{kanbansIsError.message}</p>
        ) : (
          <>
            <div>
              <Droppable droppableId="5">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="shadow-xl"
                  >
                    <div
                      className={`${
                        snapshot.isDraggingOver
                          ? "bg-rose-100/70"
                          : "bg-[#647B71]"
                      } p-3 rounded-md shadow-xl flex flex-col w-full max-h-[50vh]  overflow-y-scroll scrollbar-none `}
                    >
                      <h4 className="flex justify-between items-center mb-2">
                        <span className="text-base font-semibold text-gray-100">
                          思考歷程導引模板
                        </span>
                        <button
                          className="font-bold text-sm px-1 py-1 rounded-md transition ease-in-out bg-[#bbd6d6] hover:-translate-y-1  hover:scale-110 duration-100 ..."
                          onClick={handleOneClickUse}
                        >
                          一鍵導入
                        </button>
                      </h4>
                      <React.Fragment></React.Fragment>

                      {template.length > 0 &&
                        template.map((scaffoldingItem, index) => {
                          const keyId = scaffoldingItem.id || index;
                          return (
                            <Carditemtemplate
                              key={keyId}
                              index={index}
                              data={scaffoldingItem}
                              onImportClick={handleImport} // 这里传递函数
                            />
                          );
                        })}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>

            {kanbanData.map((column, columnIndex) => {
              return (
                <div key={column.name}>
                  <Droppable droppableId={columnIndex.toString()}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="shadow-xl"
                      >
                        <div
                          className={`${
                            snapshot.isDraggingOver
                              ? "bg-rose-100/70"
                              : "bg-gray-200"
                          } p-3 rounded-md shadow-xl flex flex-col w-full h-[58vh] overflow-y-scroll scrollbar-none`}
                        >
                          {/* 進行中看板 */}

                          <h4 className="flex justify-between items-center mb-1 h-8 rounded-md shadow-lg">
                            <span className="text-xl font-semibold text-gray-600 h-8">
                              {column.name}
                            </span>
                            {column.name == "進行中" ? (
                              <div className="flex">
                                <Lottie
                                  loop={false} // Stop looping
                                  autoplay={true} // Automatically start playing
                                  className="w-8 h-8 rotate-45"
                                  animationData={arrow}
                                />
                                <span className="font-semibold text-teal-700">
                                  當前任務
                                </span>
                              </div>
                            ) : (
                              ""
                            )}
                          </h4>
                          {column.name === "進行中" &&
                            column.task.length === 0 && (
                              <div className="flex items-center justify-center min-h-[80px] top-0 border-2 border-teal-700 rounded-md bg-transparent pointer-events-none text-teal-700 font-semibold">
                                <span>目前尚無進行中的任務</span>
                              </div>
                            )}

                          {column.task.length > 0 &&
                            column.task.map((item, index) => {
                              return (
                                <Carditem
                                  key={item.id}
                                  index={index}
                                  data={item}
                                  columnIndex={columnIndex}
                                  columnId={doingColumnId}
                                  isFirst={index === 0} // 是否是第一个条目
                                  isProgressing={column.name === "進行中"} // 是否是“进行中”列
                                />
                              );
                            })}
                          {provided.placeholder}
                        </div>
                        {column.name == "進行中" ? (
                          <React.Fragment>
                            {showForm && selectedcolumn === columnIndex ? (
                              <div className="-mt-5">
                                <textarea
                                  className="border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-customgreen w-full p-1 lg:h-14"
                                  rows={3}
                                  placeholder="Task info"
                                  onChange={handleChange}
                                />
                                <div className="flex justify-evenly">
                                  <button
                                    className="flex justify-center items-center w-1/2 my-1 mr-1 p-1 bg-white rounded-md font-bold text-sm"
                                    onClick={handleSubmit}
                                  >
                                    新增
                                  </button>
                                  <button
                                    className="flex justify-center items-center w-1/2 my-1 ml-1 p-1 bg-white rounded-md font-bold text-sm"
                                    onClick={() => {
                                      setShowForm(false);
                                    }}
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="flex justify-center items-center  py-1 bg-white rounded-md text-sm w-full hover:shadow-xl"
                                onClick={() => {
                                  setSelectedcolumn(columnIndex);
                                  setShowForm(true);
                                }}
                              >
                                加入任務
                                <FiPlus className="w-5 h-5" />
                              </button>
                            )}
                          </React.Fragment>
                        ) : (
                          ""
                        )}
                      </div>
                    )}
                  </Droppable>
                  {/* <SpringModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} /> */}
                </div>
              );
            })}
          </>
        )}
      </div>
    </DragDropContext>
  );
}
