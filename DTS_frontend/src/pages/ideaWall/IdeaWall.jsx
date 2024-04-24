import React, { useState, useEffect, useRef, useCallback } from "react";

import Modal from "../../components/Modal";
import IdeaWallSideBar from "./components/IdeaWallSideBar";
import Scaffolding from "./components/scaffolding";
import TopBar from "../../components/TopBar";
import { Network } from "vis-network";
import { visNetworkOptions as option } from "../../utils/visNetworkOptions";
import svgConvertUrl from "../../utils/svgConvertUrl";
import { useParams } from "react-router-dom";
import { useQuery,useQueryClient  } from "react-query";
import { getIdeaWall } from "../../api/ideaWall";
import { getNodes, getNodeRelation } from "../../api/nodes";
import { socket } from "../../utils/socket";
import {
  getKanbanColumns,
  getKanbanTasks,
  addCardItem,
} from "../../api/kanban";




export default function IdeaWall() {
  const container = useRef(null);
  const url = svgConvertUrl("node");
  const { projectId } = useParams();
  const [nodes, setnodes] = useState([]);
  const [nodeData, setNodeData] = useState({});
  const [edges, setEdges] = useState([]);
  const [createOptionModalOpen, setCreateOptionModalOpen] = useState(false);
  const [buildOnOptionModalOpen, setBuildOnOptionModalOpen] = useState(false);
  const [createNodeModalOpen, setCreateNodeModalOpen] = useState(false);
  const [updateNodeModalOpen, setUpdateNodeModalOpen] = useState(false);
  const [canvasPosition, setCanvasPosition] = useState({});
  const [kanbanData, setKanbanData] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");


  const queryClient = useQueryClient(); // 使用 useQueryClient 鉤子
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



  const [ideaWallInfo, setIdealWallInfo] = useState({
    id: "1",
    name: "",
    type: "",
  });
  const [selectNodeInfo, setSelectNodeInfo] = useState({
    id: "",
    title: "",
    content: "",
    owner: "",
    ideaWallId: "",
    projectId:""
  });
  const [buildOnNodeId, setBuildOnId] = useState("");
  const [tempid, setTempId] = useState("");
  // 将 currentStage 和 currentSubStage 保存在状态中
  const [currentStage, setCurrentStage] = useState(
    localStorage.getItem("currentStage")
  );
  const [currentSubStage, setCurrentSubStage] = useState(
    localStorage.getItem("currentSubStage")
  );
  console.log("curstage", currentStage);
  console.log("cursubstage", currentSubStage);
  const ideaWallInfoQuery = useQuery(
    "ideaWallInfo",
    // () => getIdeaWall(projectId, `${currentStage}-${currentSubStage}`),
    () => getIdeaWall(projectId, "1-1"),
    {
      onSuccess: (data) => {
        setIdealWallInfo(data);
        if (data) {
          const { id } = data;
          setTempId(id);
        }
      },
    }
  );
  const getNodesQuery = useQuery({
    queryKey: ["ideaWallDatas", tempid],
    queryFn: () => getNodes(tempid),
    // The query will not execute until the userId exists
    onSuccess: setnodes,
    enabled: !!tempid,
    retryOnMount: false,
  });

  const getNodeRelationQuery = useQuery({
    queryKey: ["ideaWallEdgesDatas", tempid],
    queryFn: () => getNodeRelation(tempid),
    // The query will not execute until the userId exists
    onSuccess: setEdges,
    enabled: !!tempid,
    retryOnMount: false,
  });

  // convert node to svg
  useEffect(() => {
    const temp = [];
    nodes.map((item) => {
      item.image = svgConvertUrl(item.title,item.owner);

      
      item.shape = "image";
      temp.push(item);
    });
  }, [nodes]);

  // socket
  useEffect(() => {
    function nodeUpdateEvent(data) {
      if (data) {
        console.log(data);
        getNodesQuery.refetch();
        getNodeRelationQuery.refetch();
      }
    }
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
    const handleRefreshKanban = (newStages) => {
      queryClient.invalidateQueries('getProject');
      queryClient.invalidateQueries('getSubStage');
      
  };
    socket.connect();
    socket.emit("joinProject", projectId);
    socket.on("nodeUpdated", nodeUpdateEvent);
    // socket.on("taskItems", KanbanUpdateEvent);
    // socket.on("taskItem", KanbanUpdateEvent);
    // socket.on("dragtaskItem", kanbanDragEvent);
    socket.on('refreshKanban', handleRefreshKanban);
    return () => {

    };
  }, [socket, projectId,kanbanData]);

  // vis network
  useEffect(() => {
    const network =
      container.current &&
      new Network(container.current, { nodes, edges }, option);

    network?.on("click", () => {
      setCreateOptionModalOpen(false);
      setBuildOnOptionModalOpen(false);
    });

    network?.on("doubleClick", () => {});

    network?.on("oncontext", (properties) => {
      const { pointer, event, nodes } = properties;
      event.preventDefault();
      const x_coordinate = pointer.DOM.x;
      const y_coordinate = pointer.DOM.y;
      const oncontextSelectNode = network.getNodeAt({
        x: x_coordinate,
        y: y_coordinate,
      });
      if (oncontextSelectNode) {
        setBuildOnOptionModalOpen(true);
        setBuildOnId(oncontextSelectNode);
      } else {
        setCreateOptionModalOpen(true);
      }
      setCanvasPosition({ x: x_coordinate, y: y_coordinate });
    });

    network?.on("selectNode", ({ nodes: selectNodes }) => {
      setUpdateNodeModalOpen(true);
      let nodeId = selectNodes[0];
      let nodeInfo = nodes.filter((item) => item.id === nodeId);
      setSelectNodeInfo(nodeInfo[0]);
    });

    return () => {
      network?.off("click", ({ event }) => {
        console.log(event);
      });
      network?.off("selectNode", ({ event }) => {
        console.log(event);
      });
    };
  }, [container, nodes, edges]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      setTitle(value);
    } else if (name === "content") {
      setContent(value);
    }


    setNodeData((prevData) => ({
      ...prevData,
      [name]: value,
      ideaWallId: ideaWallInfo.id,
      owner: localStorage.getItem("username"),
      from_id: buildOnNodeId,
      projectId:projectId
    }));
  };

  const handleUpdataChange = (e) => {
    const { name, value } = e.target;
    setSelectNodeInfo((prevData) => ({
      ...prevData,
      [name]: value,
      ideaWallId: ideaWallInfo.id,
      owner: localStorage.getItem("username"),
      projectId:projectId
    }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setCreateNodeModalOpen(false);
    socket.emit("nodeCreate", nodeData);
    setBuildOnId("");
    setTitle("");
    setContent("");

  };
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    setUpdateNodeModalOpen(false);
    socket.emit("nodeUpdate", selectNodeInfo);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    setUpdateNodeModalOpen(false);
    socket.emit("nodeDelete", selectNodeInfo);
  };


  

  return (
    <div className="z-10">
      {/* <TopBar />
            <IdeaWallSideBar /> */}
      {
        //to do ? :
        <div
          ref={container}
          className=" h-screen w-full pl-[70px] pt-[70px] "
        ></div>
      }
      <div className="w-full">
        <Scaffolding
          className="w-full"
          currentStage={currentStage}
          currentSubStage={currentSubStage}
        />
      </div>

      {/* create option */}
      <Modal
        open={createOptionModalOpen}
        onClose={() => setCreateOptionModalOpen(false)}
        opacity={false}
        modalCoordinate={canvasPosition}
        custom={"w-30 h-15"}
      >
        <div className="font-bold">
          <button
            onClick={() => {
              setCreateOptionModalOpen(false);
              setCreateNodeModalOpen(true);
            }}
            className="w-full h-full p-2 rounded-md bg-cyan-500 hover:bg-slate-100"
          >
            建立想法節點
          </button>
          <button
            onClick={() => setCreateOptionModalOpen(false)}
            className="w-full h-full p-2 rounded-md bg-white hover:bg-slate-100"
          >
            取消
          </button>
        </div>
      </Modal>
      {/* build on */}
      <Modal
        open={buildOnOptionModalOpen}
        onClose={() => setBuildOnOptionModalOpen(false)}
        opacity={false}
        modalCoordinate={canvasPosition}
        custom={"w-30 h-15"}
      >
        <div>
          <button
            onClick={() => {
              setBuildOnOptionModalOpen(false);
              setCreateNodeModalOpen(true);
            }}
            className="w-full h-full p-2 rounded-md bg-white hover:bg-slate-100"
          >
            延伸想法
          </button>
          <button
            onClick={() => setBuildOnOptionModalOpen(false)}
            className="w-full h-full p-2 rounded-md bg-white hover:bg-slate-100"
          >
            取消
          </button>
        </div>
      </Modal>
      {/* create modal */}
      <Modal
        open={createNodeModalOpen}
        onClose={() => setCreateNodeModalOpen(false)}
        opacity={false}
        position={"justify-center items-center"}
      >
        <div className="flex flex-col p-3">
          <h3 className=" font-bold text-base mb-3">建立想法節點</h3>
          <p className=" font-bold text-base mb-3">標題</p>
          <input
            className=" rounded  p-1 w-full mb-3 shadow-lg hover:shadow-2xl"
            type="text"
            placeholder="標題"
            name="title"
            onChange={handleChange}
            required
            value={title}
          />
          <p className=" font-bold text-base mb-3 ">內容</p>
          <textarea
            className=" rounded  w-full p-1 shadow-lg hover:shadow-2xl"
            rows={3}
            placeholder="內容"
            name="content"
            onChange={handleChange}
            required
            value={content}
          />
        </div>
        <div className="flex justify-end m-2">
          <button
            onClick={() => setCreateNodeModalOpen(false)}
            className="mx-auto w-full h-7 mb-2 bg-zinc-300 rounded font-bold text-xs sm:text-sm text-black/60 mr-2"
          >
            取消
          </button>
          <button
            onClick={handleCreateSubmit}
            className="mx-auto w-full h-7 mb-2 bg-cyan-600 rounded font-bold text-xs sm:text-sm text-white"
            disabled={!title}
          >
            儲存
          </button>
        </div>
      </Modal>
      {/* update modal */}
      {selectNodeInfo && (
        <Modal
          open={updateNodeModalOpen}
          onClose={() => setUpdateNodeModalOpen(false)}
          opacity={false}
          position={"justify-center items-center"}
        >
          <div className="flex flex-col p-3">
            <h3 className=" font-bold text-base mb-3">檢視想法節點</h3>
            <p className=" font-bold text-base mb-3">標題</p>
            <input
              className=" rounded shadow-xl p-1 w-full mb-3"
              type="text"
              placeholder="標題"
              name="title"
              value={selectNodeInfo.title}
              onChange={handleUpdataChange}
            />
            <p className=" font-bold text-base mb-3">內容</p>
            <textarea
              className=" rounded shadow-xl w-full p-1"
              rows={3}
              placeholder="內容"
              name="content"
              value={selectNodeInfo.content}
              onChange={handleUpdataChange}
            />
            <p className=" font-bold text-base mt-3">
              建立者: {selectNodeInfo.owner}
            </p>
          </div>
          {localStorage.getItem("username") === selectNodeInfo.owner ? (
            <div className="flex flex-row justify-between m-2">
              <button
                onClick={handleDelete}
                className="w-16 h-7 bg-red-500 rounded font-bold text-xs sm:text-bas text-white mr-2"
              >
                刪除
              </button>
              <div className="flex">
                <button
                  onClick={() => setUpdateNodeModalOpen(false)}
                  className="w-16 h-7  bg-zinc-300 rounded font-bold text-xs sm:text-bas text-black/60 mr-2"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  className="w-16 h-7 bg-cyan-600 rounded font-bold text-xs sm:text-bas text-white"
                >
                  儲存
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end m-2">
              <button
                onClick={() => setUpdateNodeModalOpen(false)}
                className="mx-auto w-1/3 h-7 mb-2 bg-zinc-300 rounded font-bold text-xs sm:text-base text-black/80 mr-2"
              >
                關閉
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
