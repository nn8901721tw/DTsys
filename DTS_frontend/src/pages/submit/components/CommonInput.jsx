import React from 'react'

export default function CommonInput({handleChange, type, name, index}) {
    return (
        <div>
            <p className=' font-bold text-base mb-3'>
            {name}
            </p>
            <input className=" rounded outline-none p-1 w-full mb-3 drop-shadow-md" 
            type={type} 
            name={index}
            onChange={handleChange}
            />
        </div>
    )
}
