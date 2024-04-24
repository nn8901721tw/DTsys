import React, {useState,useEffect} from 'react'
import { AiFillPushpin } from "react-icons/ai";
import { socket } from "../../../utils/socket";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getSubStage } from "../../../api/stage";

export default function TaskHint({stageInfo}) {
    const {name, description, currentStage, currentSubStage} = stageInfo;

 // 本地状态管理展示的名称和描述
 const [displayName, setDisplayName] = useState('');
 const [displayDescription, setDisplayDescription] = useState('');


    const stagesMap = {
        "1-1": "經驗分享與同理",
        "1-2": "定義利害關係人",
        "1-3": "進場域前的同理",
        "1-4": "歸類需求與問題",
        "2-1": "初步統整問題",
        "2-2": "定義問題",
        "3-1": "問題聚焦",
        "3-2": "篩選與整合方法",
        "4-1": "原型製作",
        "5-1": "原型測試與分析",
        "5-2": "開始修正",
      };
      const stagesDescriptionMap = {
        "1-1": "在 1-1 的階段中，回想自身經驗，或是身邊的人是否有同樣例子，並提供完整資訊分享給同組的夥伴，並再與小組討論完後，將想法張貼至想法牆中!",
        "1-2": "根據剛剛所發散的想法，和組員討論並歸納出利害關係人，並定義利害關係人為哪些人?",
        "1-3": "進入相關場域訪談前，必須先廣泛思考利害關係人可能遇到的問題，並和小組討論過後，再接續得出訪談的問題種類。",
        "1-4": "待實際場域訪談後，將所記錄的資料進行彙整並張貼至想法牆中，並和小組討論以歸納利害關係人所遇到的問題。",
        "2-1": "問將已張貼至想法牆中的 '利害關係人所遇到的問題' ，進行初步統整與統整歸類。",
        "2-2": "根據上階段所歸類的問題，透過小組討論篩選出真正值得解決的問題，若遲遲無法得到共識，可使用公平的投票方式。",
        "3-1": "根據前階段得出的待解決的問題，選定一個問題，並開始發散性思考解決方案，此階段不受限任何想法。",
        "3-2": "根據前階段所得的想法中，與小組成員討論，篩選並整合出最適合的解決方案。",
        "4-1": "開始實作原型，此階段可透過Figma、draw.io等等設計工具輔助，用以快速建立原型。",
        "5-1": "將產出之原型丟入實際場域進行測試，將蒐集後的資料紀錄於想法牆中，接著旱小組成員討論並分析如何改進。",
        "5-2": "根據前階段得出之結果，原型若是不夠完善，則跌代回先前階段，重新跑流程。",
      };
 // 监听 currentStage 或 currentSubStage 的变化，并更新 displayName 和 displayDescription
 useEffect(() => {
    const stageKey = `${currentStage}-${currentSubStage}`;
    if (stagesMap[stageKey] && stagesDescriptionMap[stageKey]) {
        setDisplayName(stagesMap[stageKey]);
        setDisplayDescription(stagesDescriptionMap[stageKey]);
    }
}, [currentStage, currentSubStage]);
    return (
        (name && description && currentStage && currentSubStage) ?
        <div className='bg-[#dbeeee] p-3 rounded-md shadow-md flex flex-col overflow-auto w-full h-52 max-h-[80vh] scrollbar-none'>
        
        {/* <AiFillPushpin className="text-2xl text-red-500" /> */}
            <h4 className=' flex mb-2 justify-center text-xl text-gray-600 font-bold'>
                {currentStage}-{currentSubStage}{displayName}
            </h4>
            <span className='flex text-lg font-bold'>任務說明</span>
            <span className=' text-md my-3 text-base leading-6 font-bold'>{displayDescription}</span>
            
        </div>
        : 
        <h4 className=' flex mb-2 justify-center text-xl text-gray-600 font-bold'>
            Loading
        </h4>
    )
}
