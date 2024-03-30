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
import { motion } from "framer-motion";
import { submitTask } from "../../api/submit";
import Swal from "sweetalert2";

import { DragDropContext } from "react-beautiful-dnd";
import { StrictModeDroppable as Droppable } from "../../utils/StrictModeDroppable";

import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getKanbanColumns,
  getKanbanTasks,
  addCardItem,
} from "../../api/kanban";
import { getSubStage } from "../../api/stage";
import { createTask } from "../../api/task";
import { getScaffoldingTemplate } from "../../api/scaffoldingtemplate";
import { socket } from "../../utils/socket";

export default function Kanban() {
  const [kanbanData, setKanbanData] = useState([]);
  const [newCard, setNewCard] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedcolumn, setSelectedcolumn] = useState(0);
  const { projectId } = useParams();

  const [isStagecomplete, setIsStagecomplete] = useState(false);
  const [isPreviousStageIncomplete, setIsPreviousStageIncomplete] =
    useState(false);
  const [isStageIncomplete, setIsStageIncomplete] = useState(false);
  const [stageInfo, setStageInfo] = useState({
    name: "",
    description: "",
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showContainer, setShowContainer] = useState(false);
  const [template, setTemplate] = useState([]);
  // 假设上述数据已经是一个状态或从props获取
  const [doingColumnId, setDoingColumnId] = useState(null);

  // const {
  //   isLoading: kanbanIsLoading,
  //   isError: kanbansIsError,
  //   error: KanbansError,
  //   data: KanbansData,
  // } = useQuery(["kanbanDatas", projectId], () => getKanbanColumns(projectId), {
  //   onSuccess: setKanbanData,
  // });
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

  const { data: templateData, isLoading: isLoadingTemplate, isError: isErrorTemplate } = useQuery(
    ["scaffoldingTemplate", stageInfo.currentStage, stageInfo.currentSubStage],
    () => getScaffoldingTemplate({
      stage: stageInfo.currentStage,
      subStage: stageInfo.currentSubStage,
    }), {
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
    socket.connect();
    socket.on("taskItems", KanbanUpdateEvent);
    socket.on("taskItem", KanbanUpdateEvent);
    socket.on("dragtaskItem", kanbanDragEvent);

    return () => {
      socket.off("taskItems", KanbanUpdateEvent);
      socket.off("taskItem", KanbanUpdateEvent);
      socket.disconnect();
      // socket.off('taskItem', KanbanUpdateEvent);
    };
  }, [socket]);

  useEffect(() => {
    if (
      !localStorage.getItem("currentStage") ||
      !localStorage.getItem("currentSubStage")
    ) {
      navigate(0);
    }
  }, [
    localStorage.getItem("currentStage"),
    localStorage.getItem("currentSubStage"),
  ]);

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
    ["經驗分享與同理", "定義問題", "問題聚焦", "原型製作", "原型測試與分析"],
    ["定義利害關係人", "投票", "篩選與整合方法", "", "開始修正"],
    ["進場域前的同理", "", "", "", ""],
    ["歸類需求與問題", "", "", "", ""],
  ];
  const stages3 = [
    ["分享", "問題", "聚焦", "原型", "分析"],
    ["關係人", "投票", "篩選", "", "修正"],
    ["場域前同理", "", "", "", ""],
    ["歸類", "", "", "", ""],
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

  const { mutate } = useMutation(submitTask, {
    onSuccess: (res) => {
      if (res.message === "done") {
        // sucesssNotify("全部階段已完成")
        localStorage.setItem("stageEnd", "true");
      }
      // sucesssNotify(res.message)
      localStorage.removeItem("currentStage");
      localStorage.removeItem("currentSubStage");
      navigate(`/project/${projectId}/kanban`);
    },
    onError: (error) => {
      console.log(error);
      errorNotify(error.response.data.message);
    },
  });

  const handleSubmitTask = async (e) => {
    e.preventDefault();

    // 使用 SweetAlert2 彈出對話框
    const result = await Swal.fire({
      title: "是否完成？",
      text: "確定提交此任務嗎？",
      icon: "question",
      showCancelButton: true,
      cancelButtonText: "取消",
      confirmButtonText: "確定",
    });

    // 如果用戶確定，執行提交操作
    if (result.isConfirmed) {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("currentStage", stageInfo.currentStage);
      formData.append("currentSubStage", stageInfo.currentSubStage);
      formData.append("content", "123");

      // 執行提交操作
      mutate(formData);
    }
  };

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
      // 遍历所有模板，为每个模板创建一个新的任务
      const tasksCreationPromises = template.map(scaffoldingItem => {
        if (!scaffoldingItem || !scaffoldingItem.scaffolding_template) {
          throw new Error("Invalid scaffolding item"); // 或者可以选择跳过这个项目
        }
        const newTask = {
          content: scaffoldingItem.scaffolding_template,
          columnId: doingColumnId, // 使用之前找到的进行中的列 ID
        };
        return createTask(newTask); // 假设 createTask 是用来调用 API 创建任务的函数
      });
  
      // 等待所有任务创建操作完成
      const responses = await Promise.all(tasksCreationPromises);
      console.log("All tasks created:", responses.map(res => res.data));
  
      // 更新前端状态或提示用户
    } catch (error) {
      console.error('Error creating tasks:', error);
    }
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
        <div className="transition-all duration-500 transform flex flex-col items-center bg-slate-200 mx-56 2xl:mx-96 rounded-2xl opacity-100 scale-y-100 text-gray-700">
          <div className="wrapper">
            <div className="flex font-bold text-lg pt-1 2xl:text-2xl 2xl:pt-5 2xl:font-extrabold">
              階段
            </div>
          </div>

          <div className="wrapper flex flex-row">
            {stages1.map((subStage, index) => (
              <div key={index} className="flex justify-center pt-1 2xl:pt-5">
                <React.Fragment>
                  {index !== 0 && (
                    <hr className="border-solid border-t-8 w-6 items-center justify-center my-auto border-[#C4D8D9]" />
                  )}
                  <div
                    className={`relative px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md h-14 2xl:h-20 text-xl font-bold text-center flex items-center justify-center ${
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
            <div className="flex font-bold text-lg pt-1 2xl:text-2xl 2xl:pt-5 2xl:font-extrabold">
              子階段
            </div>
          </div>
          <div className="wrapper flex flex-col">
            {stages2.map((stage, stageIndex) => (
              <div
                key={stageIndex}
                className="flex flex-row justify-center pt-1 2xl:pt-5"
              >
                {stage.map((subStage, subStageIndex) => (
                  <React.Fragment key={subStageIndex}>
                    {subStageIndex !== 0 && (
                      <hr className="border-solid border-t-8 w-6 items-center justify-center my-auto border-[#E2E8F0]" />
                    )}
                    {subStage ? (
                      <div
                        className={`relative px-3 w-32 2xl:w-48 2xl:text-xl rounded-md h-12 2xl:h-16 text-sm font-bold text-gray-700 text-center flex items-center justify-center cursor-pointer ${
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
                      <div className=" px-3 w-32 2xl:w-48 2xl:text-2xl rounded-md h-12 2xl:h-16 text-sm font-bold text-white text-center flex items-center justify-center bg-[#E2E8F0] cursor-default ">
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
                <FiChevronUp className=" animate-bounce w-5 h-5 2xl:w-8 2xl:h-8" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-row justify-center mx-auto bg-slate-100 px-24 pt-20 2xl:pt-24">
        <div className="wrapper flex flex-row">
          {stages1.map((subStage, index) => (
            <div key={index} className="flex justify-center pt-1 2xl:pt-5">
              <React.Fragment>
                {index !== 0 && (
                  <hr className="border-solid border-t-8 w-6 items-center justify-center my-auto border-[#C4D8D9]" />
                )}
                <div
                  className={`px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md h-14 2xl:h-20 text-xl font-bold text-white text-center flex items-center justify-center ${
                    parseInt(stageInfo.currentStage) === index + 1
                      ? "bg-[#5698a0] animate-pulse"
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
          className=" 2xl:text-lg transition ease-in-out delay-150 hover:translate-y-2 hover:scale-125  duration-300"
          onClick={() => {
            setShowContainer(true); // 新增的部分
          }}
        >
          <FiChevronDown className="animate-bounce w-5 h-5  2xl:w-8 2xl:h-8" />
        </button>
      </div>
      <div className="flex justify-end bg-slate-100 pr-28 -mt-7">
        <button
          className={`text-sm font-bold transition delay-150 duration-300 px-4 py-2 2xl:px-4 2xl:py-2 rounded-md ${
            isPreviousStageIncomplete || isStageIncomplete || isStagecomplete // 新增 isStagecomplete 到條件中
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-teal-500 hover:-translate-y-1 hover:scale-110 hover:bg-teal-500 text-white"
          }`}
          onClick={handleSubmitTask}
          disabled={
            isPreviousStageIncomplete || isStageIncomplete || isStagecomplete
          } // 根據 isStagecomplete 設置 disabled
        >
          {isPreviousStageIncomplete || isStageIncomplete
            ? "請完成先前階段"
            : isStagecomplete
            ? "已完成"
            : "完成此階段"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5  px-28 pt-2 2xl:pt-12 min-w-[800px] h-screen overflow-hidden bg-slate-100  ">
        <TaskHint stageInfo={stageInfo} />

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
                          : "bg-gray-300"
                      } p-3 rounded-md shadow-xl flex flex-col w-full max-h-[65vh] 2xl:max-h-[70vh] overflow-y-scroll scrollbar-none`}
                    >
                      <button onClick={handleOneClickUse}> 一鍵使用</button>
                      <h4 className="flex justify-between items-center mb-2">
                        <span className="text-xl font-semibold text-gray-600">
                          思考歷程模板
                        </span>
                      </h4>

                      <React.Fragment>
                        {/* {showForm && selectedcolumn === columnIndex ? (
                          <div>
                            <textarea
                              className="border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-customgreen w-full p-1"
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
                            className="flex justify-center items-center my-1 py-1 bg-white rounded-md text-lg"
                            onClick={() => {
                              setSelectedcolumn(columnIndex);
                              setShowForm(true);
                            }}
                          >
                            <FiPlus className="w-5 h-5" />
                          </button>
                        )} */}
                      </React.Fragment>

                      {template.length > 0 &&
                        template.map((scaffoldingItem, index) => {
                          const keyId = scaffoldingItem.id || index;
                          return (
                            <Carditemtemplate
                              key={keyId}
                              index={index}
                              data={scaffoldingItem} // 传递整个对象而不是 scaffolding_template 字符串
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
                              : "bg-gray-100"
                          } p-3 rounded-md shadow-xl flex flex-col w-full max-h-[65vh] 2xl:max-h-[70vh] overflow-y-scroll scrollbar-none`}
                        >
                          <h4 className="flex justify-between items-center mb-2">
                            <span className="text-xl font-semibold text-gray-600">
                              {column.name}
                            </span>
                          </h4>

                          <React.Fragment>
                            {showForm && selectedcolumn === columnIndex ? (
                              <div>
                                <textarea
                                  className="border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-customgreen w-full p-1"
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
                                className="flex justify-center items-center my-1 py-1 bg-white rounded-md text-lg"
                                onClick={() => {
                                  setSelectedcolumn(columnIndex);
                                  setShowForm(true);
                                }}
                              >
                                <FiPlus className="w-5 h-5" />
                              </button>
                            )}
                          </React.Fragment>

                          {column.task.length > 0 &&
                            column.task.map((item, index) => {
                              return (
                                <Carditem
                                  key={item.id}
                                  index={index}
                                  data={item}
                                  columnIndex={columnIndex}
                                />
                              );
                            })}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </>
        )}
      </div>
    </DragDropContext>
  );
}
