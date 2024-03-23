import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // 引入 react-icons 的 Chevron 圖示
import { CSSTransition } from "react-transition-group";
import { v4 as uuidv4 } from "uuid";
import Carditem from "./components/Carditem";
import TaskHint from "./components/TaskHint";
import Loader from "../../components/Loader";
import { motion } from "framer-motion";

import { DragDropContext } from "react-beautiful-dnd";
import { StrictModeDroppable as Droppable } from "../../utils/StrictModeDroppable";

import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getKanbanColumns,
  getKanbanTasks,
  addCardItem,
} from "../../api/kanban";
import { getSubStage } from "../../api/stage";
import { socket } from "../../utils/socket";

export default function Kanban() {
  const [kanbanData, setKanbanData] = useState([]);
  const [newCard, setNewCard] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedcolumn, setSelectedcolumn] = useState(0);
  const { projectId } = useParams();
  const [stageInfo, setStageInfo] = useState({ name: "", description: "" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showContainer, setShowContainer] = useState(false);

  const {
    isLoading: kanbanIsLoading,
    isError: kanbansIsError,
    error: KanbansError,
    data: KanbansData,
  } = useQuery(["kanbanDatas", projectId], () => getKanbanColumns(projectId), {
    onSuccess: setKanbanData,
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
      },
      enabled: !!localStorage.getItem("currentStage"),
    }
  );

  //to do multiple usequery or custom hook
  //frist column query
  // const {
  //   isLoading : columnLoading1,
  //   isError : columnIsError1,
  //   error : columnError1,
  //   data : columnData1
  // } = useQuery(
  //     ['kanbanDatas', kanbanData?.kanban[0]?.id],
  //     () => getKanbanTasks(kanbanData?.kanban[0]?.id),
  //     {
  //         onSuccess: () => {

  //           if(columnData1 !== undefined){
  //             const temp = [...kanbanData.kanban];
  //             setKanbanTask(temp, kanbanData?.kanban[0]?.id, columnData1)
  //           }
  //         },
  //         enabled: !!kanbanData?.kanban[0]?.id,
  //     }
  // );
  // second column query
  // const {
  //   isLoading : columnLoading2,
  //   isError : columnIsError2,
  //   error : columnError2,
  //   data : columnData2
  // } = useQuery(
  //     ['kanbanDatas', kanbanData?.kanban[1]?.id],
  //     () => getKanbanTasks(kanbanData?.kanban[1]?.id),
  //     {
  //         onSuccess: () => {
  //           if(columnData2 !== undefined && columnData.kanban){
  //             const temp = [...columnData.kanban];
  //             console.log(temp);
  //             setKanbanTask(temp, kanbanData?.kanban[1]?.id, columnData2)
  //           }
  //         },
  //         enabled: !!kanbanData?.kanban[1]?.id,
  //     }
  // );

  //Third column query
  // const {
  //   isLoading : columnLoading3,
  //   isError : columnIsError3,
  //   error : columnError3,
  //   data : columnData3
  // } = useQuery(
  //     ['kanbanDatas', kanbanData?.kanban[2]?.id],
  //     () => getKanbanTasks(kanbanData?.kanban[2]?.id),
  //     {
  //         onSuccess: () => {
  //           if(columnData3 !== undefined && columnData.kanban){
  //             const temp = [...columnData.kanban];
  //             setKanbanTask(temp, kanbanData?.kanban[2]?.id, columnData3)
  //           }
  //         },
  //         enabled: !!kanbanData?.kanban[2]?.id,
  //     }
  // );

  // set column query into useState [columnData, setColumnData]
  // to do move to utils
  // const setKanbanTask = (temp, itemId, data ) =>{
  //   let index = temp.findIndex( item => item.id === itemId);
  //   console.log(index);

  //   if( index !== -1){
  //     temp[index] = {
  //       ...temp[index],
  //       task : data
  //     }
  //   }
  //   console.log(temp);
  //   setColumnData({...columnData,kanban:temp})
  //   // setKanbanData({ ...kanbanData, kanban: temp })
  //   // maybe conflict with useQuery ['kanbanDatas', projectId]
  // }

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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <motion.div
       initial="hidden"
       animate={showContainer ? "visible" : "hidden"}
       exit="exit"
       variants={containerVariants}
       transition={{ duration: 0.8 }}
       className="fixed top-16 left-0 right-0 z-10"
       style={{
         opacity: showContainer ? 1 : 0,
         y: showContainer ? 0 : 50,
         visibility: showContainer ? "visible" : "hidden",
       }}
      >
        <div className="transition-all duration-500 transform flex flex-col items-center bg-slate-200 mx-56 2xl:mx-96 rounded-2xl opacity-100 scale-y-100">
          <div className="wrapper">
            <div className="flex text-base font-bold  ">階段</div>
          </div>

          <div className="wrapper">
            <div className="flex justify-center px-24 pt-4 2xl:pt-10">
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#63999F] h-14 2xl:h-20 text-xl font-bold text-white text-center flex items-center justify-center">
                同理
              </div>
              <hr className="border-[#C4D8D9] border-solid border-t-8 w-6 items-center justify-center my-auto" />

              <div className=" px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-14 2xl:h-20 text-xl font-bold text-white text-center flex items-center justify-center">
                定義
              </div>

              <hr className="border-[#C4D8D9] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-14 2xl:h-20 text-xl font-bold text-white text-center flex items-center justify-center">
                發想
              </div>
              <hr className="border-[#C4D8D9] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-14 2xl:h-20 text-xl font-bold text-white text-center flex items-center justify-center">
                原型
              </div>
              <hr className="border-[#C4D8D9] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-14 2xl:h-20 text-xl font-bold text-white text-center flex items-center justify-center">
                測試
              </div>
            </div>
          </div>
          <div className="flex text-base font-bold">子階段</div>
          <div className="wrapper">
            <div className="flex justify-center px-24 pt-2 2xl:pt-10">
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center">
                同理
              </div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center">
                定義
              </div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center">
                發想
              </div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center">
                原型
              </div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center">
                測試
              </div>
            </div>
          </div>
          <div className="wrapper">
            <div className="flex justify-center px-24 pt-4 2xl:pt-10">
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center">
                同理
              </div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center">
                定義
              </div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center">
                發想
              </div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-slate-200 h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center"></div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center">
                測試
              </div>
            </div>
          </div>
          <div className="wrapper">
            <div className="flex justify-center px-24 pt-4 2xl:pt-10">
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center">
                同理
              </div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-slate-200 h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center"></div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-slate-200 h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center"></div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-slate-200 h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center"></div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-slate-200 h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center"></div>
            </div>
          </div>
          <div className="wrapper">
            <div className="flex justify-center px-24 pt-4 2xl:pt-10">
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center">
                同理
              </div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-slate-200 h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center"></div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-slate-200 h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center"></div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-slate-200 h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center"></div>
              <hr className="border-[#E2E8F0] border-solid border-t-8 w-6 items-center justify-center my-auto" />
              <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-slate-200 h-10 2xl:h-14 text-xl font-bold text-white text-center flex items-center justify-center"></div>
            </div>
          </div>

          <div className="wrapper">
            <div className="bg-slate-200 flex justify-center w-full">
              <button
                className="ml-2 hover:text-gray-700 focus:outline-none transition ease-in-out delay-150 hover:-translate-y-3 hover:scale-150  duration-300"
                onClick={() => setShowContainer(!showContainer)}
              >
                <FiChevronUp className="w-5 h-5 2xl:w-8 2xl:h-8" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

    

      <div className="flex flex-row justify-center mx-auto bg-slate-100 px-24 pt-20 2xl:pt-24">
        <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#63999F] h-14 2xl:h-20 text-xl font-bold text-white text-center flex items-center justify-center">
          同理
        </div>
        <hr className="border-[#C4D8D9] border-solid border-t-8 w-6 items-center justify-center my-auto" />
        <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-14 2xl:h-20 text-xl font-bold text-white text-center flex items-center justify-center">
          定義
        </div>
        <hr className="border-[#C4D8D9] border-solid border-t-8 w-6 items-center justify-center my-auto" />
        <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-14 2xl:h-20 text-xl font-bold text-white text-center flex items-center justify-center">
          發想
        </div>
        <hr className="border-[#C4D8D9] border-solid border-t-8 w-6 items-center justify-center my-auto" />
        <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-14 2xl:h-20 text-xl font-bold text-white text-center flex items-center justify-center">
          原型
        </div>
        <hr className="border-[#C4D8D9] border-solid border-t-8 w-6 items-center justify-center my-auto" />
        <div className="px-3 w-32 2xl:w-48 2xl:text-3xl rounded-md bg-[#C4D8D9] h-14 2xl:h-20 text-xl font-bold text-white text-center flex items-center justify-center">
          測試
        </div>
      </div>

      <div className="bg-slate-100 flex items-center justify-center">
        <button
          className="text-lg transition ease-in-out delay-150 hover:translate-y-2 hover:scale-125  duration-300"
          onClick={() => {
            setShowContainer(true); // 新增的部分
          }}
        >
          <FiChevronDown className="w-5 h-5  2xl:w-8 2xl:h-8" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5  px-28 pt-2 2xl:pt-12 min-w-[800px] h-screen overflow-hidden bg-slate-100  ">
        <TaskHint stageInfo={stageInfo} />
        {kanbanIsLoading ? (
          <Loader />
        ) : kanbansIsError ? (
          <p className=" font-bold text-4xl">{kanbansIsError.message}</p>
        ) : (
          kanbanData.map((column, columnIndex) => {
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
                            ? " bg-rose-100/70"
                            : "bg-gray-100"
                        } p-3 rounded-md shadow-xl flex flex-col  w-full max-h-[65vh] 2xl:max-h-[70vh] overflow-y-scroll scrollbar-none`}
                      >
                        {/* <div className= {`${snapshot.isDraggingOver ? ' bg-rose-100/70' : 'bg-gray-100'} p-3 rounded-md shadow-md flex flex-col  w-full max-h-[70vh] overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-400/70 scrollbar-track-slate-200 scrollbar-thumb-rounded-full scrollbar-track-rounded-full`}> */}
                        <h4 className=" flex justify-between items-center mb-2 ">
                          <span className=" text-xl font-semibold text-gray-600 ">
                            {column.name}
                          </span>
                        </h4>
                        {showForm && selectedcolumn === columnIndex ? (
                          <div>
                            <textarea
                              className="border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-customgreen w-full p-1"
                              rows={3}
                              placeholder="Task info"
                              onChange={handleChange}
                            />
                            <div className=" flex justify-evenly ">
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
                            className="flex justify-center items-center my-1 py-1 bg-white rounded-md text-lg  "
                            onClick={() => {
                              setSelectedcolumn(columnIndex);
                              setShowForm(true);
                            }}
                          >
                            <FiPlus className="w-5  h-5" />
                          </button>
                        )}
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
          })
        )}
      </div>
    </DragDropContext>
  );
}
