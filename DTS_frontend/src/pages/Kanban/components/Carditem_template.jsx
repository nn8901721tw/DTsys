import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import ColorPicker from "./ColorPicker";
import AssignMember from "./AssignMember";
import { getProjectUser } from "../../../api/users";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";

import { BsArrowRight } from "react-icons/bs"; // 使用進入的圖標
import { GrFormClose } from "react-icons/gr";
import { FiEdit } from "react-icons/fi";
import { AiOutlineTag } from "react-icons/ai";
import { BsFillPersonFill } from "react-icons/bs";
import { Draggable } from "react-beautiful-dnd";
import { socket } from "../../../utils/socket";

export default function Carditemtemplate({
  keyId,
  index,
  data,
  onImportClick,
}) {
  const [open, setOpen] = useState(false);
  const [tagModalopen, setTagModalOpen] = useState(false);
  const [assignMemberModalopen, setAssignMemberModalOpen] = useState(false);
  const { projectId } = useParams();
  const [cardData, setCardData] = useState({
    id: "",
    scaffolding_template: "",
    // "content":"",
    // "labels":[],
    // "assignees": []
  });
  const [menberData, setMenberData] = useState([]);
  const [labelData, setLabelData] = useState([]);
  const [clickedCardIndex, setClickedCardIndex] = useState(null);

  // const handleClick = () => {
  //   setClickedCardIndex(index);
  // };

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
    socket.emit("cardUpdated", { cardData, columnIndex, index });
    setOpen(false);
  };

  useEffect(() => {
    // 保证 data 是有定义的，并且包含 scaffolding_template 属性
    if (data && data.scaffolding_template) {
      setCardData({
        ...cardData,
        scaffolding_template: data.scaffolding_template,
        id: index.toString(), // 如果 data 中没有 id，使用 index 作为 id
      });
    }
  }, [data, index]);

  return (
    <>
      <Draggable key={keyId} index={index} draggableId={`item-${index}`} isDragDisabled={true} isDropDisabled={true}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${
              snapshot.isDragging
                ? "border-2 border-emerald-700 bg-sky-300"
                : "border-0 bg-slate-100"
            } rounded-md p-3 mt-3 truncate min-h-[80px] max-w-full shadow-md`}
          >
            <div>
              <span className="text-md my-3 text-base leading-6">
                {cardData.scaffolding_template}
              </span>

              <div className="flex justify-end">

                 <button className="text-emerald-800 font-bold text-sm 2xl:font-semibold 2xl:text-base px-1 py-1 2xl:px-4 2xl:py-2 rounded-md transition ease-in-out bg-[#b8dfdf] hover:-translate-y-1 hover:scale-110 duration-100 ..." onClick={() => onImportClick(data)}>導入</button>
              </div>

              <div className="flex flex-row justify-between items-center">
 
              </div>
            </div>
          </div>
        )}
      </Draggable>

    
    </>
  );
}
