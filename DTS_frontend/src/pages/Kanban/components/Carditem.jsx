import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import ColorPicker from './ColorPicker';
import AssignMember from './AssignMember';
import { getProjectUser } from '../../../api/users';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';

import { BsArrowRight } from "react-icons/bs"; // 使用進入的圖標
import { GrFormClose } from "react-icons/gr";
import { FiEdit } from "react-icons/fi";
import { AiOutlineTag } from "react-icons/ai";
import { BsFillPersonFill } from "react-icons/bs";
import { Draggable } from 'react-beautiful-dnd';
import { socket } from '../../../utils/socket';


export default function Carditem({ data, index, columnIndex }) {
  const [ open, setOpen ] = useState(false)
  const [ tagModalopen, setTagModalOpen ] = useState(false)
  const [ assignMemberModalopen, setAssignMemberModalOpen ] = useState(false)
  const {projectId} = useParams();
  const [ cardData, setCardData ] = useState({
    "id":"",
    "title": "",
    "content":"",
    "labels":[],
    "assignees": []
  })
  const [ menberData, setMenberData ] = useState([]);
  const [ labelData, setLabelData ] = useState([]);
  const [clickedCardIndex, setClickedCardIndex] = useState(null);

  const handleClick = () => {
    setClickedCardIndex(index);
  };

  const getProjectUserQuery = useQuery( "getProjectUser", () => getProjectUser(projectId), 
    {
      onSuccess: setMenberData,
      enabled:!!projectId
    }
  );

  useEffect(()=>{
    setCardData(data);
  },[data])
  
  const cardDataReset = () => {
    if(open === true){
      setCardData(data);
    };
  }
  const cardHandleChange = (e) => {
    const {name, value} = e.target;
    setCardData( prev => ({
      ...prev,
      [name]:value
    }));
  }
  const cardHandleSubmit = () => {
    socket.emit("cardUpdated", {cardData, columnIndex, index});
    setOpen(false);
  }
  



  return (
    <>
    <Draggable  index={index} draggableId={data && data.id ? data.id.toString() : " "}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${
            snapshot.isDragging ? 'border-2 border-emerald-700 bg-sky-300' : 'border-0 bg-white'
          } rounded-md p-3 mt-3 truncate min-h-[80px] max-w-full shadow-md`}
        >
          <div>
            <span className=' text-md my-3 text-base leading-6'>{data.content}</span>
            <div className='flex justify-between '>
              <span className='flex text-lg text-zinc-700'>{data.title}</span>
              <div className="flex items-center">
                <FiEdit onClick={() => setOpen(true)} className='w-5 h-5 cursor-pointer mr-2'/>
                <BsArrowRight onClick={() => setOpen(true)} className='w-5 h-5 cursor-pointer'/>
              </div>
            </div>  
            
            
            <div className='flex flex-row justify-between items-center'>
              <div className='flex justify-start'>
                {data.labels &&
                  data?.labels.map((label, index) => (
                    <div key={index} className={` ${label.bgcolor} p-2 rounded-full ${label.textcolor} text-xs font-bold text-center flex items-center h-[20px]`}>
                      {label.content}
                    </div> 
                  ))}
              </div>
              <div className="flex justify-end items-center space-x-1">
                {data.assignees &&
                  data?.assignees.map((assignee, index) => (
                    <div key={index} className={`w-8 h-8 bg-slate-100 border-[1px] border-slate-400 rounded-full flex items-center text-center p-2 shadow-xl text-xs overflow-hidden cursor-default`}>
                      {assignee.username}
                    </div>
                  ))}
              </div>
            </div> 
          </div>
        </div>
      )}
  </Draggable>

    {/* edit card modal */}
    {
      cardData &&
      <Modal open={open} onClose={() => setOpen(false)} opacity={true} position={"justify-center items-center"}> 
      <div className='flex justify-between'>
        <div className='flex flex-col w-2/3'>
          <input className=" rounded outline-none ring-2 p-1 ring-customgreen w-full mb-3" 
            type="text" 
            placeholder="title"
            name='title'
            value={cardData.title} 
            onChange={cardHandleChange}
            />
          <textarea className=" rounded outline-none ring-2 ring-customgreen w-full p-1" 
            rows={3} 
            placeholder="Task info" 
            name='content'
            value={cardData.content}
            onChange={cardHandleChange}
            /> 
        </div>
        <div className='flex flex-col w-1/3 ml-4'>
          <button onClick={() => setTagModalOpen(true)} className="flex justify-start items-center w-full h-7 mb-2 bg-customgray rounded font-bold text-xs sm:text-sm text-black/60">
            <AiOutlineTag className='w-3 h-3 sm:w-5 sm:h-5 mx-2 text-black'/>
            標籤
          </button>
          <button onClick={() => setAssignMemberModalOpen(true)} className="flex justify-start items-center w-full h-7 mb-2 bg-customgray rounded font-bold text-xs sm:text-sm text-black/60">
            <BsFillPersonFill className='w-3 h-3 sm:w-5 sm:h-5 mx-2 text-black'/>
            指派成員
          </button>
        </div>
      </div>
      <div className='flex justify-between mt-2'>
        <div className='flex flex-col w-1/3'>
          <p className="flex justify-start items-center w-full h-7 m-1 font-bold text-sm sm:text-base text-black/60 ">
            標籤
          </p>
          {
            cardData.labels &&
            cardData.labels.map((label, index) =>{
              return(
                <div key={index} className={` ${label.bgcolor} p-2 rounded-full ${label.textcolor} text-xs font-bold text-center flex items-center w-fit h-6`}>
                  {label.content}
                </div>
              )
            })
          }
          <p className="flex justify-start items-center w-full h-7 m-1 font-bold text-sm sm:text-base text-black/60">
            指派成員
          </p>
          <div className='flex flex-row'>
            {
              cardData.assignees &&
              cardData.assignees.map((assignee, index) => {
                return(
                  <div key={index} className={`w-8 h-8 border-[1px] border-slate-400 bg-slate-100 rounded-full flex items-center text-center p-2 shadow-xl text-xs overflow-hidden cursor-default`}>
                    {assignee.username}
                  </div>
                )
              })
            }
          </div>
        </div>
        <div className='flex flex-row items-end w-1/3 ml-4'>
          <button className="flex justify-center items-center w-full h-7 mb-2 bg-customgray rounded font-bold text-xs sm:text-sm text-black/60 mr-2" 
            onClick={() => {
              setOpen(false);
              cardDataReset();
            }}>
            取消
          </button>
          <button className="flex justify-center items-center w-full h-7 mb-2 bg-[#A2C4C6] rounded font-bold text-xs sm:text-sm text-white"
            onClick={cardHandleSubmit}
            >
            儲存
          </button>
        </div>
      </div>
    </Modal>
    }
    {/* tag modal */}
    {
      <Modal open={tagModalopen} onClose={() => setTagModalOpen(false)} opacity={false} position={"justify-end items-center m-3"}> 
          <button onClick={() => setTagModalOpen(false)} className=' absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200'>
            <GrFormClose  className=' w-6 h-6'/>
          </button> 
          <ColorPicker />
      </Modal>
    }
    {/* AssignMember modal */}
    {
      <Modal open={assignMemberModalopen} onClose={() => setAssignMemberModalOpen(false)} opacity={false} position={"justify-end items-center m-3"}> 
          <button onClick={() => setAssignMemberModalOpen(false)} className=' absolute top-1 right-1 rounded-lg bg-white hover:bg-slate-200'>
            <GrFormClose  className=' w-6 h-6'/>
          </button> 
          <AssignMember menberData={menberData} setMenberData={setMenberData} setCardData={setCardData} cardHandleSubmit={cardHandleSubmit}/>
      </Modal>
    }
    </>
  )
}
