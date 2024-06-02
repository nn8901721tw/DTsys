import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import ColorPicker from "./ColorPicker";
import AssignMember from "./AssignMember";
import { getProjectUser } from "../../../api/users";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import Swal from "sweetalert2";
import { BsArrowRight } from "react-icons/bs"; // 使用進入的圖標
import { GrFormClose } from "react-icons/gr";
import { FiEdit } from "react-icons/fi";
import { AiOutlineTag } from "react-icons/ai";
import { BsFillPersonFill } from "react-icons/bs";
import { Draggable } from "react-beautiful-dnd";
import { socket } from "../../../utils/socket";
import { MovingBorder } from "./ui/moving-border.jsx";
import Lottie from "lottie-react";
import cardarrow from "../../../assets/cardarrow.json";
import { BsPersonCircle } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

export default function Carditem({
  data,
  index,
  columnIndex,
  isFirst,
  isProgressing,
  columnId,
}) {
  const [open, setOpen] = useState(false);
  const [tagModalopen, setTagModalOpen] = useState(false);
  const [assignMemberModalopen, setAssignMemberModalOpen] = useState(false);
  const { projectId } = useParams();
  const [projectEnd, setProjectEnd] = useState(
    localStorage.getItem("ProjectEnd")
  );
  const [userId, setUserId] = useState(
    localStorage.getItem("id")
  );
// console.log("projectEnd",projectEnd);
  const [cardData, setCardData] = useState({
    id: "",
    title: "",
    content: "",
    labels: [],
    assignees: [],
  });
  const [menberData, setMenberData] = useState([]);
  const [labelData, setLabelData] = useState([]);
  const [clickedCardIndex, setClickedCardIndex] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  // 判断是否是“进行中”并且是第一张卡片
  const shouldAnimate = isFirst && isProgressing;

  // 计算边框样式和动画类
  const borderClass = shouldAnimate ? "border-2 border-red-500" : "border-0";

  const handleClick = () => {
    setClickedCardIndex(index);
  };

  const getProjectUserQuery = useQuery(
    "getProjectUser",
    () => getProjectUser(projectId),
    {
      onSuccess: setMenberData,
      enabled: !!projectId,
    }
  );

  useEffect(() => {
    setCardData(data);
  }, [data]);

  const cardDataReset = () => {
    if (open === true) {
      setCardData(data);
    }
  };
  const cardHandleChange = (e) => {
    const { name, value } = e.target;
    setCardData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const cardHandleSubmit = () => {
    socket.emit("cardUpdated", { cardData, columnIndex, index, projectId });
    setOpen(false);
  };
  // 计算边框样式
  // 计算边框样式
  //  const borderClass = isFirst && isProgressing ? 'border-2 border-blue-500 rounded-md' : '';
  const borderStyle =
    isFirst && isProgressing ? "border-2 border-blue-500 rounded-md" : "";
  const navigate = useNavigate(); // 创建导航函数

  const handleNavigate = () => {
    navigate(`/project/${projectId}/ideaWall`); // 使用模板字符串导航到 Ideal Wall 页面
  };

  const cardHandleDelete = () => {
    Swal.fire({
      title: "刪除",
      text: "確定要刪除卡片嗎?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3d9696",  // 设置确认按钮颜色
      cancelButtonColor: "#c5c8c9",   // 设置取消按钮颜色
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      reverseButtons: true,  // 反转按钮位置，使确认按钮在右侧
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("columnId", columnId);
        socket.emit("cardDelete", { cardData, columnId, index });
        setOpen(false);
      }
    });
  };

  const colors = ["bg-[#C47D09]", "bg-[#D2B800]", "bg-[#578082]", "bg-[#16A34A]", "bg-[#115E59]","bg-[#4ECDC5]"];

  return (
    <>
      <Draggable
        index={index}
        draggableId={data && data.id ? data.id.toString() : " "}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${borderStyle} rounded-md p-3 truncate min-h-[100px] max-w-full shadow-md  font-semibold hover:shadow-xl mt-1 hover:skew-y-1  ${
              snapshot.isDragging ? "bg-sky-300 " : "bg-white"
            }`}
          >
            <div className="truncate">
              <span className=" text-md my-3 text-base leading-6 w-3/5 ">
                {index + 1}. {data.content}
              </span>
              <div className="flex justify-between  ">
                <span className="flex text-lg text-">{data.title}</span>
                <div className="flex items-center">
                  {projectEnd && (
                    <FiEdit
                      onClick={() => setOpen(true)}
                      className="w-5 h-5 cursor-pointer mr-2"
                    />
                  )}
                  {isFirst && isProgressing ? (
                    <Lottie
                      onClick={handleNavigate}
                      className="w-5 h-5 cursor-pointer"
                      animationData={cardarrow}
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>

              <div className="flex flex-row justify-between items-center">
                <div className="flex justify-start">
                  {data.labels &&
                    data?.labels.map((label, index) => (
                      <div
                        key={index}
                        className={` ${label.bgcolor} p-2 rounded-full ${label.textcolor} text-xs font-bold text-center flex items-center h-[20px]`}
                      >
                        {label.content}
                      </div>
                    ))}
                </div>
                <div className="flex justify-end items-center space-x-1">
                  {data.assignees &&
                    data?.assignees.map((assignee, index) => {
                      const bgColor = colors[(assignee.id - 1) % colors.length]; // 使用用户 ID 取模来获取颜色
                      return (
  
                        <div key={index} className="relative group z-0">
                          <div
                            className={`${bgColor} -mx-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer`}
                          >
                            <BsPersonCircle className="w-full h-full text-white" />
                          </div>
                          {/* Tooltip */}
                          <div
                            className={`${bgColor} absolute opacity-0 group-hover:opacity-100 text-white text-xs rounded-lg p-2  transition-all duration-200 ease-in-out transform group-hover:translate-y-20 group-hover:scale-105 hidden group-hover:block bottom-full mb-2`}
                          >
                            {assignee.username}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {/* edit card modal */}
      {cardData && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          opacity={true}
          position={"justify-center items-center"}
        >
          <div className="flex justify-between">
            <div className="flex flex-col w-2/3">
              <input
                className=" rounded shadow-lg p-1 w-full mb-3"
                type="text"
                placeholder="title"
                name="title"
                value={cardData.title}
                onChange={cardHandleChange}
              />
              <textarea
                className=" rounded shadow-lg w-full p-1"
                rows={3}
                placeholder="Task info"
                name="content"
                value={cardData.content}
                onChange={cardHandleChange}
              />
            </div>
            <div className="flex flex-col w-1/3 ml-4">
              <button
                onClick={() => setTagModalOpen(true)}
                className="flex justify-start items-center w-full h-7 mb-2 bg-customgray rounded font-bold text-xs sm:text-sm text-black/60"
              >
                <AiOutlineTag className="w-3 h-3 sm:w-5 sm:h-5 mx-2 text-black" />
                標籤
              </button>
              <button
                onClick={() => setAssignMemberModalOpen(true)}
                className="flex justify-start items-center w-full h-7 mb-2 bg-customgray rounded font-bold text-xs sm:text-sm text-black/60"
              >
                <BsFillPersonFill className="w-3 h-3 sm:w-5 sm:h-5 mx-2 text-black" />
                指派成員
              </button>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex flex-col w-1/3">
              <p className="flex justify-start items-center w-full h-7 m-1 font-bold text-sm sm:text-base text-black/60 ">
                標籤
              </p>
              {cardData.labels &&
                cardData.labels.map((label, index) => {
                  return (
                    <div
                      key={index}
                      className={` ${label.bgcolor} p-2 rounded-full ${label.textcolor} text-xs font-bold text-center flex items-center w-fit h-6`}
                    >
                      {label.content}
                    </div>
                  );
                })}
              <p className="flex justify-start items-center w-full h-7 m-1 font-bold text-sm sm:text-base text-black/60">
                指派成員
              </p>
              <div className="flex flex-row">
                {cardData.assignees &&
                  cardData.assignees.map((assignee, index) => {
                    const bgColor = colors[(assignee.id - 1) % colors.length]; // 使用用户 ID 取模来获取颜色
                    return (

                      <div key={index} className="relative group">
                        <div
                          className={`${bgColor} -mx-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer`}
                        >
                          <BsPersonCircle className="w-full h-full text-white" />
                        </div>
                        {/* Tooltip */}
                        <div
                          className={`${bgColor} absolute opacity-0 group-hover:opacity-100 text-white text-xs rounded-lg p-2 z-10 transition-all duration-200 ease-in-out transform group-hover:translate-y-28 group-hover:scale-105 hidden group-hover:block bottom-full mb-2`}
                        >
                          {assignee.nickname}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="flex flex-row items-end w-1/3 ml-4">
              <button
                className="flex justify-center items-center w-full h-7 mb-2 bg-[#fa3c3c] rounded font-bold text-xs sm:text-sm text-white mr-2"
                onClick={cardHandleDelete}
              >
                刪除
              </button>
              <button
                className="flex justify-center items-center w-full h-7 mb-2 bg-[#cbcfcf] rounded font-bold text-xs sm:text-sm text-black/60 mr-2"
                onClick={() => {
                  setOpen(false);
                  cardDataReset();
                }}
              >
                取消
              </button>
              <button
                className="flex justify-center items-center w-full h-7 mb-2 bg-[#A2C4C6] rounded font-bold text-xs sm:text-sm text-gray-700 "
                onClick={cardHandleSubmit}
              >
                儲存
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* tag modal */}
      {
        <Modal
          open={tagModalopen}
          onClose={() => setTagModalOpen(false)}
          opacity={false}
          position={"justify-end items-center m-3"}
        >
          <button
            onClick={() => setTagModalOpen(false)}
            className=" absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200"
          >
            <GrFormClose className=" w-6 h-6" />
          </button>
          <ColorPicker />
        </Modal>
      }
      {/* AssignMember modal */}
      {
        <Modal
          open={assignMemberModalopen}
          onClose={() => setAssignMemberModalOpen(false)}
          opacity={false}
          position={"justify-end items-center m-3"}
        >
          <button
            onClick={() => setAssignMemberModalOpen(false)}
            className=" absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200"
          >
            <GrFormClose className=" w-6 h-6" />
          </button>
          <AssignMember
            menberData={menberData}
            setMenberData={setMenberData}
            setCardData={setCardData}
            cardHandleSubmit={cardHandleSubmit}
          />
        </Modal>
      }
    </>
  );
}
