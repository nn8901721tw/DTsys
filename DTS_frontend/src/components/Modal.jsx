import React, {useState, useEffect} from 'react'
import { GrFormClose } from "react-icons/gr"

export default function Modal({ open, onClose, opacity, position, modalCoordinate, children, custom }) {
    const [coordinate, setCoordinate] = useState({})
    useEffect(()=>{
        setCoordinate(modalCoordinate);
    },[modalCoordinate])
    return (
        <>
            {
                coordinate ?
                <div style={{top: `${coordinate.y}px`, left: `${coordinate.x}px`}} className={`fixed flex transition-colors  ${open ? "visible" : "invisible"} ${opacity ? "bg-black/50" : ""} ${position} z-[1000]`}>
                    <div onClick={(e) => e.stopPropagation()} className={` bg-white rounded-md shadow transition-all duration-300 ${custom ? custom : "w-3/4 sm:w-1/3"} ${open ? "scale-100 opacity-100" : "scale-75 opacity-0"}`} >
                        {children}
                        </div>
                </div>   
                :
                <div className={`fixed inset-0 flex transition-colors ${open ? "visible  z-[1000]" : "invisible"} ${opacity ? "bg-black/50 " : ""} ${position}`}>
                    <div onClick={(e) => e.stopPropagation()} className={`bg-[#F7F6F6] rounded-md shadow p-8 transition-all duration-300 ${custom ? custom : "w-3/4 sm:w-1/3 2xl:w-1/3 "} ${open ? "scale-100 opacity-100" : "scale-75 opacity-0"}`} >
                        {children}
                        </div>
                </div> 
            }
        </>
    )
}

