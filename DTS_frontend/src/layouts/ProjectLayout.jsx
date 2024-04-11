import React from 'react'
import TopBar from '../components/TopBar';
import SideBar from '../components/SideBar';
import { Outlet, useLocation, useParams } from 'react-router-dom';

export default function ProjectLayout() {
    const location = useLocation();
    const { projectId } = useParams();
    return (
        <div className='min-w-full min-h-screen h-screen overflow-hidden overflow-x-scroll scrollbar-thin'>
            {
                // location.pathname === `/project/:${projectId}/ideaWall` ?(
                //     <></>
                // ):(
                    <>
                        <TopBar className='z-20' />
                        <SideBar  className='z-10'/> 
                    </>
                // )
            } 
            <Outlet />
        </div>
    )
}
