import React, { useState, useEffect } from 'react';AiTwotoneFolderAdd
import { AiTwotoneFolderAdd } from "react-icons/ai";
import { GrFormClose } from "react-icons/gr";
import { useQuery, useQueryClient } from 'react-query';
import { getAllSubmit } from '../../api/submit';
import { useParams } from 'react-router-dom';
import Loader from '../../components/Loader';
import FolderModal from './components/folderModal';

export default function Protfolio() {
    const [ stageProtfolio, setStageProtfolio ] = useState([]);
    const [ folderModalOpen, setFolderModalOpen ] = useState(false);
    const [ modalData, setModalData ] = useState({});
    const {projectId} = useParams();
    
    const {
        isLoading,
        isError,
    } = useQuery( "protfolioDatas", () => getAllSubmit(
        {  params: { projectId: projectId } }), 
        {onSuccess:setStageProtfolio }
    );
    
    return (
            <div className='min-w-full min-h-screen h-screen'>
                <div className='flex flex-col my-5 pl-20 pr-5 sm:px-20 py-16 w-full h-screen justify-start items-start'>
                <h3 className='text-lg font-bold mb-4'>歷程檔案</h3> 
                    <div className=' flex flex-wrap justify-start items-center w-full mb-5'>
                    {        
                        isLoading  ? <Loader />:  
                        isError ? <p className=' font-bold text-2xl'>{isError.message}</p> :  
                        stageProtfolio.map( item =>{
                            const { id, stage } = item;
                            return(
                                <div className='flex mx-3' key={id}>
                                    <button 
                                        className="inline-flex items-center bg-white hover:bg-slate-200/80 text-slate-400 border-2 border-slate-200 font-semibold rounded-md p-1 mt-3 sm:px-4 text-base min-w-[100px]"
                                        onClick={() => {
                                            setFolderModalOpen(true);
                                            setModalData(item);
                                        }}
                                    >
                                        <AiTwotoneFolderAdd size={32} className=" text-black mr-1" /> <span>{stage}</span>
                                    </button>
                                </div>
                            )
                        })
                    }        
                        {/* <div className='flex mx-3'>
                            <button className="inline-flex items-center bg-white hover:bg-slate-200/80 text-slate-400 border-2 border-slate-200 font-semibold rounded-md p-1 mt-3 sm:px-4 text-base min-w-[100px]">
                            <AiTwotoneFolderAdd size={32} className=" text-black" /> <span>想法牆</span>
                            </button>
                        </div>
                        <div className='flex mx-3'>
                            <button className="inline-flex items-center bg-white hover:bg-slate-200/80 text-slate-400 border-2 border-slate-200 font-semibold rounded-md p-1 mt-3 sm:px-4 text-base min-w-[100px]">
                            <AiTwotoneFolderAdd size={32} className=" text-black" /> <span>反思日誌</span>
                            </button>
                        </div> */}
                    </div>
                    <FolderModal folderModalOpen={folderModalOpen} setFolderModalOpen={setFolderModalOpen} modalData={modalData}/>
                </div> 
                
            </div>
    )
}
