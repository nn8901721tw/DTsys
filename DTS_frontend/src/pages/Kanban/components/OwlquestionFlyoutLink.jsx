import React from "react";
import { motion } from "framer-motion";

const PricingContent = ({ onImageClick }) => {
  return (
    <div className="w-56 bg-white p-6 shadow-xl space-y-3">
      <div className="hover:shadow-xl cursor-pointer" onClick={() => onImageClick("在我上方的灰色小方塊是子階段提示，這裡顯示當下子階段的目標及任務說明，大家要記得看喔!")}>
        <h3 className="font-semibold">子階段提示</h3>
        <img src="/images/kanban_taskhint.png" alt="Introduction" className="w-9/12 h-auto" />
      </div>
      <div className="hover:shadow-xl cursor-pointer" onClick={() => onImageClick("此為階段流程地圖，點擊下方的拓展按鈕可以觀看設計思考五階段以及各自的子階段。")}>
        <h3 className="font-semibold">階段流程地圖</h3>
        <img src="/images/kanban_map.png" alt="Process Map" className="w-full h-auto"/>
      </div>
      <div className="hover:shadow-xl cursor-pointer" onClick={() => onImageClick("思考歷程導引模板可透過點擊'導入'或'一鍵導入'來使用 ，這些模板為各個子階段中預設的任務，使用他們可幫助你們快速上手喔!")}>
        <h3 className="font-semibold">思考歷程導引模板</h3>
        <img src="/images/kanban_template.png" alt="Scaffolding Template" className="w-9/12 h-auto"/>
      </div>
      <div className="hover:shadow-xl cursor-pointer" onClick={() => onImageClick("大家可以把要做的任務添加至'進行中'，越上面的優先順序越高，如藍色框內的任務即為當下首要任務!")}>
        <h3 className="font-semibold">排程工具</h3>
        <img src="/images/kanban_board.png" alt="Scheduling Tool" className="w-full h-auto"/>
      </div>
      {/* <button className="w-full rounded-lg border border-neutral-950 px-4 py-2 font-semibold hover:bg-neutral-950 hover:text-white transition-colors">
        Contact sales
      </button> */}
    </div>
  );
};

const OwlquestionFlyoutLink = ({ onImageClick }) => {
  return (
    <>
      <style>
        {`
          .flyout-link::before {
            content: '';
            position: absolute;
            left: -2px;
            top: 50%;
            width: 0;
            height: 0;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            border-right: 10px solid white;
            transform: translateY(-50%);
          }
        `}
      </style>
      <motion.div
      initial={{ opacity: 0, x: -50, scale: 0.5 }} // Start from left and scaled down
      animate={{ opacity: 1, x: 0, scale: 1 }}     // End at normal position and scale
      exit={{ opacity: 0, x: -100, scale: 0.5 }}    // Exit the same way it entered
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flyout-link fixed bottom-0 left-64 mb-4 ml-4 bg-white text-black shadow-lg p-4 rounded-lg"
    >
      <PricingContent onImageClick={onImageClick} />
      </motion.div>
    </>
  );
};

export default OwlquestionFlyoutLink;
