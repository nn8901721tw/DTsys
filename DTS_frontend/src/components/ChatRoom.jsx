import React, { useState, useEffect, useRef } from 'react'
import { GrFormClose, GrSend } from "react-icons/gr";
import { useParams } from 'react-router-dom';
import { socket } from '../utils/socket';

export default function ChatRoom({chatRoomOpen, setChatRoomOpen}) {
    const [ currentMessage, setCurrentMessage ] = useState("");
    const { projectId } = useParams();
    const [ messageList, setMessageList ] = useState([]);
    const bottomRef = useRef(null);

    const sendMessage = async() =>{
        if(currentMessage !== ""){
            const messageData = {
                room: projectId,
                author: localStorage.getItem("username"),
                message: currentMessage,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
            };
            socket.emit("send_message", messageData);
            setMessageList(prev => [...prev, messageData])
        }
    }

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messageList]);

    useEffect(() => {
        function receive_message(data) {
            setMessageList(prev => [...prev, data])
            console.log(data);
        }
        
        if (chatRoomOpen === true) {
            socket.emit("join_room", projectId);
            console.log("join_room");
        }
        socket.on("receive_message", receive_message)
        return () => {
            socket.off('receive_message', receive_message);
        };
    }, [socket, chatRoomOpen]);
    return (
        <div className= {`w-[300px] h-[500px] fixed right-5 bottom-0 border-2 p-0 border-black/70 rounded bg-slate-100 ${chatRoomOpen ? "visible" : "invisible"}`}>
            <div className='h-[31px] w-full flex justify-between text-base p-1 bg-gray-400 text-white'>
                <span>專案討論區</span>
                <button onClick={()=>{setChatRoomOpen(false)}} className='cursor-pointer rounded-lg hover:bg-gray-200 '>
                    <GrFormClose size={20} />
                </button>
            </div>
            <div className='h-[430px] w-full py-3 relative overflow-x-hidden overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-400/70 scrollbar-track-slate-200 scrollbar-thumb-rounded-full scrollbar-track-rounded-full'>
                {
                    messageList.map((messages, index) => {
                        return (
                            <div key={index} className={`flex h-auto p-1 ${messages.author===localStorage.getItem("username")? "justify-end": "justify-start"}`}> 
                                <div>
                                    <div className={`w-fit max-w-[120px] rounded text-white flex items-center break-all px-[5px] mx-[5px] ${messages.author===localStorage.getItem("username")? "bg-green-700 m-auto": "bg-sky-700"}`}>
                                        {messages.message}
                                    </div>
                                    <div className='flex justify-end text-xs mx-[5px]'>
                                        <p>{messages.time}</p>
                                        <p>{messages.author}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
                <div ref={bottomRef} />
            </div>
            <div className=' h-[35px] w-full flex justify-between text-base p-0 border-t-2 bg-slate-50 border-black/70'>
                <input 
                    type="text" 
                    className='w-10/12 outline-none p-1'
                    onChange={e => setCurrentMessage(e.target.value)}
                    onKeyDown={e => {e.key === "Enter" && sendMessage()}}
                />
                <button 
                    className='mx-auto'
                    onClick={sendMessage}
                >
                    <GrSend size={20} />
                </button>
            </div>
        </div>
    )
}
