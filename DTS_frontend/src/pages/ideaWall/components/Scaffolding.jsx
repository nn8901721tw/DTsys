import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submitTask } from "../../../api/submit";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { socket } from "../../../utils/socket";
import Tag from "../../../assets/Tag.png";
import { moveTaskToCompleted } from "../../../api/kanban";
import Swal from "sweetalert2";
import { AiFillTag } from "react-icons/ai";
import { getSubStage } from "../../../api/stage";
import { getProject } from "../../../api/project";
import {
  getKanbanColumns,
  getKanbanTasks,
  addCardItem,
} from "../../../api/kanban";
import { AiFillPushpin } from "react-icons/ai";
import Lottie from "lottie-react";
import welldone from "../../../assets/welldone.json";

const Scaffolding = ({ onTaskComplete }) => {
  const navigate = useNavigate();

  const [kanbanData, setKanbanData] = useState([]);
  // 将 currentStage 和 currentSubStage 保存在状态中
  const [currentStage, setCurrentStage] = useState(
    localStorage.getItem("currentStage")
  );
  const [currentSubStage, setCurrentSubStage] = useState(
    localStorage.getItem("currentSubStage")
  );
  // 将 currentStage 和 currentSubStage 保存在状态中
  const [projectname, setProjectname] = useState(localStorage.getItem("name"));
  // 将 currentStage 和 currentSubStage 保存在状态中
  const [projectEnd, setProjectEnd] = useState(
    localStorage.getItem("ProjectEnd")
  );

  useEffect(() => {
    if (!currentStage || !currentSubStage) {
      console.log("Nocurrent!!!");
    }
  }, [currentStage, currentSubStage]);

  const { projectId } = useParams();

  const [inProgressTasks, setInProgressTasks] = useState([]);

  const queryClient = useQueryClient();

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
        // setDoingColumnId(data[0].id);
      }
    },
  });

  console.log("scaffolding", kanbanData);
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
        localStorage.getItem("currentStage");
        localStorage.getItem("currentSubStage");

        // setcstage()
      },
      enabled: !!localStorage.getItem("currentStage"),
    }
  );

  const getProjectQuery = useQuery("getProject", () => getProject(projectId), {
    onSuccess: (data) => {
      localStorage.setItem("currentStage", data.currentStage);
      localStorage.setItem("currentSubStage", data.currentSubStage);
      localStorage.setItem("name", data.name);
      localStorage.setItem("ProjectEnd", data.ProjectEnd);
      setCurrentSubStage(data.currentSubStage);
      setCurrentStage(data.currentStage);
      setProjectname(data.name);
      setProjectEnd(data.ProjectEnd);
    },
    enabled: !!projectId,
  });
  useEffect(() => {
    socket.emit("joinProject", projectId);

    function KanbanUpdateEvent(data) {
      if (data) {
        console.log(data);
        queryClient.invalidateQueries(["kanbanDatas", projectId]);
      }
    }
    const handleRefreshKanban = (newStages) => {
      queryClient.invalidateQueries("getProject");
      queryClient.invalidateQueries("getSubStage");
    };
    function kanbanDragEvent(data) {
      if (data) {
        console.log(data);
        setKanbanData(data);
      }
    }
    socket.on("templateUpdated", KanbanUpdateEvent);
    socket.on("dragtaskItem", kanbanDragEvent);
    socket.on("refreshKanban", handleRefreshKanban);
    socket.on("taskItem", KanbanUpdateEvent);
    socket.on("taskItems", KanbanUpdateEvent);
    return () => {};
  }, [socket, projectId]);
  ///////////////////////

  const completeTask = () => {
    if (inProgressTasks.length > 0 && kanbanData.length >= 2) {
      const taskId = inProgressTasks[0].id;
      const inProgressColumnId = kanbanData[0].id; // 进行中列的ID
      const completedColumnId = kanbanData[1].id; // 完成列的ID
      console.log("inProgressColumnId", inProgressColumnId);
      console.log("completedColumnId", completedColumnId);
      Swal.fire({
        title: "是否已完成此任務?",
        text: "確認後將無法撤銷！",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "是的, 已完成!",
        cancelButtonText: "取消",
      }).then((result) => {
        if (result.isConfirmed) {
          moveTaskToCompleted(taskId, inProgressColumnId, completedColumnId)
            .then((response) => {
              console.log("Task moved successfully:", response);
              socket.emit("taskUpdated"); // 廣播任務更新事件

              Swal.fire("完成!", "任務已成功移動至完成列。", "success").then(
                () => {
                  queryClient.invalidateQueries(["kanbanDatas", projectId]);
                }
              );
            })
            .catch((error) => {
              console.error("Failed to move task:", error);
              Swal.fire({
                title: "錯誤!",
                text: "任務移動失敗。",
                icon: "error",
                confirmButtonText: "確定",
              });
            });
        }
      });
    } else {
      Swal.fire({
        title: "注意!",
        text: "沒有進行中的任務或者缺少必要數據。",
        icon: "warning",
        confirmButtonText: "確定",
      });
    }
  };

  const getNextStageDescription = (currentStage, currentSubStage) => {
    const currentKey = `${currentStage}-${currentSubStage}`;
    const keys = Object.keys(stagesMap);
    const currentIndex = keys.indexOf(currentKey);
    const nextIndex = currentIndex + 1;
    return nextIndex < keys.length
      ? `${keys[nextIndex]} ${stagesMap[keys[nextIndex]]}`
      : "已達終點";
  };
  const nextStageDescription = getNextStageDescription(
    currentStage,
    currentSubStage
  );

  // Helper to extract sub-stage ID from description
  const extractSubStageId = (description) => {
    const matchedKey = Object.keys(stagesMap).find(
      (key) => stagesMap[key] === description
    );
    return matchedKey || "";
  };

  // Determine the background color based on active sub-stage
  const getBackgroundColor = (subStageId) => {
    return `${currentStage}-${currentSubStage}` === subStageId
      ? "bg-[#4ECDC5] animate-pulse"
      : "bg-[#C4D8D9]";
  };
  // Determine the background color based on active sub-stage
  const getTextColor = (subStageId) => {
    return `${currentStage}-${currentSubStage}` === subStageId
      ? "text-[#4ECDC5]  animate-pulse"
      : "text-[#C4D8D9]";
  };
  // Get the list of sub-stages for the current stage
  const currentSubStages = Object.keys(stagesMap).filter((key) =>
    key.startsWith(`${currentStage}-`)
  );

  // Get background color based on current stage
  const getStageColor = (stageNumber) => {
    return currentStage === stageNumber ? "bg-[#63999F]" : "bg-[#acc7ce]";
  };

  const stages3 = [
    ["分享", "問題", "聚焦", "原型", "分析"],
    ["關係人", "投票", "篩選", "", "修正"],
    ["場域前同理", "", "", "", ""],
    ["歸類", "", "", "", ""],
  ];
  const { mutate } = useMutation(submitTask, {
    onSuccess: (res) => {
      if (res.message === "done") {
        // sucesssNotify("全部階段已完成")
        localStorage.setItem("stageEnd", "true");
      }
      // sucesssNotify(res.message)
      localStorage.removeItem("currentStage");
      localStorage.removeItem("currentSubStage");
    },
    onError: (error) => {
      console.log(error);
      errorNotify(error.response.data.message);
    },
  });
  const handleSubmitTask = async (e) => {
    e.preventDefault();

    const resultUpload = await Swal.fire({
      title: "成果上傳",
      text: "是否有成果要上傳？",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "沒有",
      confirmButtonText: "上傳",
    });

    if (resultUpload.isConfirmed) {
      navigate(`/project/${projectId}/submitTask`);
      console.log("進行上傳成果的操作");
    }
  };

  useEffect(() => {
    const tasksInProgress =
      kanbanData.find((column) => column.name === "進行中")?.task || [];
    setInProgressTasks(tasksInProgress);
    console.log("進行中的任務:", tasksInProgress);
    console.log("kanbanData:", kanbanData);
  }, [currentStage, currentSubStage, kanbanData, socket]); // 確保當 kanbanData 更新時重新運行此效果





  return (
    <div className=" w-64 p-6  bg-slate-700 rounded-lg shadow-md divide-y divide-gray-200 fixed top-24 right-2 h-4/5  z-20  overflow-y-auto overflow-x-hidden scrollbar-none ">
      <div className="pb-2">
        <div className="flex">
          <div className="flex fixed top-[70px] left-20 text-[#648891] cursor-default">
            <AiFillTag className="w-6 h-6" />
            <span className="justify-center items-center translate-x-2 font-semibold">
              主題 : {projectname}
            </span>
          </div>
          {/* <div className="flex -translate-x-3">
            <AiFillPushpin className=" text-[#787c85] w-7 h-5" />
            <h4 className="font-bold text-[#83A7A9] pl-2 ">
              {currentStage}-{currentSubStage}
              {stagesMap[`${currentStage}-${currentSubStage}`] ||
                "Unknown Stage"}
            </h4>
          </div> */}
        </div>
        {projectEnd ? (
          <>
            <span className="font-semibold text-teal-700 text-xl">
              恭喜你! 全都完成了!{" "}
            </span>
            <Lottie className="w-40 h-40" animationData={welldone} />
          </>
        ) : (
          <>
            {inProgressTasks.length > 0 ? (
              <h2 className="text-base font-semibold text-gray-200  truncate w-[200px] cursor-default">
                當前子任務-
                <span
                  className="text-[#57a5ff] font-bold whitespace-nowrap "
                  title={inProgressTasks[0].content}
                >
                  {inProgressTasks[0].content}
                </span>
              </h2>
            ) : (
              <h2 className="text-lg font-semibold text-gray-200">
                進行中的子任務皆已完成
              </h2>
            )}

            <h2 className="text-base font-semibold text-gray-400">建議</h2>
            <p className="mt-1 text-sm text-gray-200">
              請使用滑鼠右鍵創建想法節點，並依照右側流程步驟製作發想。
            </p>
            <div className="flex justify-end">
              {inProgressTasks.length > 0 ? (
                <button
                  className=" text-neutral-50 font-bold text-sm 2xl:font-semibold  px-1 py-1 rounded-md transition ease-in-out bg-[#4b7fbb] hover:-translate-y-1  hover:scale-110 duration-100 ..."
                  onClick={completeTask}
                >
                  子任務完成
                </button>
              ) : (
                <div className="flex text-sm w-full ">
                  <div className="my-auto font-semibold justify-start text-xs text-[#37a59e]">
                    進入下個子階段-
                  </div>
                  <div
                    className=" cursor-pointer text-neutral-50 text-xs 2xl:font-semibold  px-1 py-1 rounded-md transition ease-in-out bg-[#37a59e] hover:-translate-y-1  hover:scale-110 duration-100 ..."
                    onClick={handleSubmitTask}
                  >
                    {nextStageDescription}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="pt-2">
        <section className=" left-[37px] flex flex-col items-start justify-start gap-[1px] text-left text-mini text-cyan-500 font-inter cursor-default">
          <div className="w-full flex gap-[2px] justify-around">
            <div
              className={
                getStageColor(1) +
                " rounded text-white font-semibold flex items-center h-[30px] min-w-[30px] px-1"
              }
            >
              同理
            </div>
            <div
              className={
                getStageColor(2) +
                " rounded text-white font-semibold flex items-center h-[30px] min-w-[30px] px-1"
              }
            >
              定義
            </div>
            <div
              className={
                getStageColor(3) +
                " rounded text-white font-semibold flex items-center h-[30px] min-w-[30px] px-1"
              }
            >
              發想
            </div>
            <div
              className={
                getStageColor(4) +
                " rounded text-white font-semibold flex items-center h-[30px] min-w-[30px] px-1"
              }
            >
              原型
            </div>
            <div
              className={
                getStageColor(5) +
                " rounded text-white font-semibold flex items-center h-[30px] min-w-[30px] px-1"
              }
            >
              測試
            </div>
          </div>

          <div className="w-full flex flex-row py-0  box-border text-lg text-gray">
            <div className="flex-1 flex flex-col ">
              {/* <div className="w-[90px] h-4 relative">
                <div className="absolute top-[14px] left-[0px] box-border w-[92px] h-0.5 z-[2] border-t-[2px] border-solid border-gainsboro" />
                <div className="absolute top-[0px] left-[0px] box-border w-0.5 h-[17px] z-[3] border-r-[2px] border-solid border-gainsboro" />
              </div> */}
              <div className=" self-stretch flex flex-row  ">
                <div className=" flex-1 flex flex-col ">
                  {/* <div key={index} className="flex flex-col items-center justify-center">
                    <div className="bg-[#4ECDC5] h-[14px] w-[14px] rounded-full z-[2]" />
                    <div className="relative leading-[21px] font-semibold z-[1] text-base">
                      原型製作
                    </div>
                    <div className="bg-slate-300 w-[2px] h-9 z-[2]" />
                  </div> */}
                  {currentSubStages.length > 0 ? (
                    currentSubStages.map((subStageId, index) => {
                      const isActiveSubStage =
                        `${currentStage}-${currentSubStage}` === subStageId;
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center justify-center"
                        >
                          <div className="bg-slate-300 w-[2px] h-9"></div>
                          <div className="flex flex-col items-center justify-center">
                            <div
                              className={`${getBackgroundColor(
                                subStageId
                              )} h-[14px] w-[14px] rounded-full`}
                            ></div>
                            <div
                              className={`${getTextColor(
                                subStageId
                              )} text-base font-semibold`}
                            >
                              {subStageId}
                              {stagesMap[subStageId]}
                            </div>
                            {isActiveSubStage &&
                              inProgressTasks.map((task, taskIndex) => (
                                <div
                                  key={taskIndex}
                                  className="flex flex-col w-full items-end translate-x-8 "
                                >
                                  {taskIndex === 0 && (
                                    <div className="w-[110px] h-4 relative">
                                      <div className="absolute top-[14px] left-[0px] box-border w-[110px] h-0.5 z-[2] border-t-[2px] border-solid border-gainsboro" />
                                      <div className="absolute top-[0px] left-[0px] box-border w-0.5 h-[17px] z-[3] border-r-[2px] border-solid border-gainsboro" />
                                    </div>
                                  )}
                                  <div className="bg-slate-300 w-[2px] h-9"></div>

                                  <div
                                    className="flex flex-col items-end justify-between w-full cursor-default"
                                    title={task.content}
                                  >
                                    <div
                                      className={`h-[10px] w-[10px] rounded-full ${
                                        taskIndex === 0
                                          ? "bg-[#3279ca] animate-pulse"
                                          : "bg-gray-400"
                                      }`}
                                    ></div>
                                    <span className={`pl-14 font-semibold truncate w-[160px] text-xs text-right ${
                                        taskIndex === 0
                                          ? "text-[#57a5ff] animate-pulse"
                                          : "text-gray-400"
                                      }`}>
                                      {task.content}
                                    </span>
                                  </div>
                                  {taskIndex === inProgressTasks.length - 1 && (
                                    <div className="w-[110px] h-4 relative">
                                      <div className="absolute top-[0px] left-[0px] box-border w-[110px] h-[15px] z-[3] border-r-[2px] border-solid border-gainsboro" />
                                      <div className="absolute top-[14px] left-[0px] box-border w-[110px] h-0.5 z-[2] border-t-[2px] border-solid border-gainsboro" />
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500">
                      No sub-stages available for this stage.
                    </p>
                  )}
                  <div className="flex flex-col w-full justify-center items-center">
                    <div className="bg-slate-300 w-[2px] h-10 "></div>

                    {projectEnd ? (
                      <div className=" text-base font-semibold text-teal-400 animate-bounce">
                        END! Congratulations!
                      </div>
                    ) : (
                      <div className=" text-base font-semibold text-slate-400">
                        進入下個子階段...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Scaffolding;
