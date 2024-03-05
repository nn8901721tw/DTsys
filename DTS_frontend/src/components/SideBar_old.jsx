import React, {useState} from 'react';
import { Link, useParams } from 'react-router-dom';
import {FaBars} from 'react-icons/fa';
import { IoBulbOutline } from 'react-icons/io5';
import { AiOutlineProject } from "react-icons/ai";
import { BsBezier2, BsChatText, BsJournalText, BsFolder } from "react-icons/bs";
import { GrCompliance } from "react-icons/gr";
import ChatRoom from './ChatRoom';


export default function SideBar() {
    const [ open, setOpen ] = useState(false);
    const [ chatRoomOpen, setChatRoomOpen ] = useState(false);
    const { projectId } = useParams();
    const menus = [
        { name: "專案", link: `/project/${projectId}/kanban`, icon: AiOutlineProject, margin:"true"},
        { name: "想法牆", link: `/project/${projectId}/ideaWall`, icon: IoBulbOutline },
        { name: "管理階段", link: `/project/${projectId}/managePhase`, icon: BsBezier2 },
        { name: "繳交任務", link: `/project/${projectId}/submitTask`, icon: GrCompliance },
        { name: "撰寫日誌", link: `/project/${projectId}/reflection`, icon: BsJournalText },
        { name: "學習歷程", link:`/project/${projectId}/protfolio`, icon:BsFolder}
    ]

    return (
        <>
            <div className={` bg-[#FFF] absolute inset-y-16 left-0 min-h-screen duration-500 border-r-2 ${open ? "w-40" : "w-16"}`}>
                <div className='mt-2 py-3 pl-3 flex justify-start'>
                    <FaBars size={26} className='cursor-pointer' onClick={()=>setOpen(!open)}/>
                </div>
                <div className='mt-4 flex flex-col gap-4 relative'>
                {
                    projectId === undefined ? <></> :
                    menus?.map((menu, i) => (
                    <Link to={menu?.link} key={i} className={`${menu?.margin && "mt-5"} group flex items-center text-sm gap-3.5 font-medium p-3 hover:bg-slate-100 rounded-sm`}>
                        <div>{React.createElement(menu?.icon, { size: "26" })}</div>
                        <h2 style={{transitionDelay: `${i + 1}00ms`,}} className={`whitespace-pre duration-500 ${!open && "opacity-0 translate-x-28 overflow-hidden"}`}>
                        {menu?.name}
                        </h2>
                        <h2 className= {`${ open && 'hidden'} absolute left-14 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg p-0 w-0  overflow-hidden group-hover:p-1  group-hover:w-fit`}>
                        {menu?.name}
                        </h2>
                    </Link>
                    ))
                }
                {
                    projectId === undefined ? <></> :
                    <span onClick={()=>setChatRoomOpen(true)} className="group flex items-center text-sm gap-3.5 font-medium p-3 hover:bg-slate-100 rounded-sm cursor-pointer">
                        <div>
                            <BsChatText size={"26"}/>
                        </div>
                        <h2 style={{transitionDelay: "700ms",}} className={`whitespace-pre duration-500 ${!open && "opacity-0 translate-x-28 overflow-hidden"}`}>
                            聊天室
                        </h2>
                        <h2 className= {`${ open && 'hidden'} absolute left-14 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg p-0 w-0  overflow-hidden group-hover:p-1  group-hover:w-fit`}>
                            聊天室
                        </h2>
                    </span>
                }
                </div>   
            </div>
            <ChatRoom chatRoomOpen={chatRoomOpen} setChatRoomOpen={setChatRoomOpen}/>
        </>
    )
}
