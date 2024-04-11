import React from "react";
import Tag from "../../../assets/Tag.png";
const Scaffolding = ({ currentStage, currentSubStage, inProgressTasks }) => {
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

  // Helper to extract sub-stage ID from description
  const extractSubStageId = (description) => {
    const matchedKey = Object.keys(stagesMap).find(
      (key) => stagesMap[key] === description
    );
    return matchedKey || "";
  };

  // Determine the background color based on active sub-stage
  const getBackgroundColor = (subStageId) => {
    return `${currentStage}-${currentSubStage}` === subStageId
      ? "bg-[#4ECDC5]"
      : "bg-[#C4D8D9]";
  };
  // Determine the background color based on active sub-stage
  const getTextColor = (subStageId) => {
    return `${currentStage}-${currentSubStage}` === subStageId
      ? "text-[#4ECDC5]"
      : "text-[#C4D8D9]";
  };
  // Get the list of sub-stages for the current stage
  const currentSubStages = Object.keys(stagesMap).filter((key) =>
    key.startsWith(`${currentStage}-`)
  );

  // Get background color based on current stage
  const getStageColor = (stageNumber) => {
    return currentStage === stageNumber ? "bg-[#63999F]" : "bg-[#C4D8D9]";
  };

  const stages3 = [
    ["分享", "問題", "聚焦", "原型", "分析"],
    ["關係人", "投票", "篩選", "", "修正"],
    ["場域前同理", "", "", "", ""],
    ["歸類", "", "", "", ""],
  ];
  // // 篩選出包含當前階段編號的子階段
  // const filteredSubStages = stages2
  //   .flat()
  //   .filter((stage) => stage.includes(`${currentStage}-`));
  // // 将子阶段名称解析为仅包含 ID 的字符串
  // const extractSubStageId = (subStageName) => {
  //   const match = subStageName.match(/(\d+-\d+)/); // 使用正则表达式匹配 "数字-数字" 格式
  //   return match ? match[0] : ""; // 返回匹配到的子阶段 ID 或空字符串
  // };

  // const getBackgroundColor = (subStage) => {
  //   return `${currentStage}-${currentSubStage}` === subStage
  //     ? "bg-[#4ECDC5]"
  //     : "bg-[#C4D8D9]";
  // };
  // console.log("inProgressTasks",inProgressTasks[0].content);
  return (
    <div className=" w-64 p-6 bg-white rounded-lg shadow-md divide-y divide-gray-200 fixed top-20 right-2 h-4/5 2xl:h-3/5 z-20  overflow-y-auto overflow-x-hidden scrollbar-none ">
      <div className="pb-2">
        <div className="flex">
          <img className="w-5 h-5 bg-transparent" src={Tag} alt="/" />
          <h4 className="font-bold text-[#83A7A9] pl-2 ">
            {currentStage}-{currentSubStage}
            {stagesMap[`${currentStage}-${currentSubStage}`] || "Unknown Stage"}
          </h4>
        </div>

        {inProgressTasks.length > 0 ? (
          <h2 className="text-lg font-semibold text-gray-900">
            當前任務-{inProgressTasks[0].content}
          </h2>
        ) : (
          <h2 className="text-lg font-semibold text-gray-900">
            當前無進行中任務
          </h2>
        )}
        <p className="mt-1 text-sm text-gray-600">
          請點擊左側導航欄，並依照步驟開始製作。
        </p>
        <h2 className="text-base font-semibold text-gray-900">建議</h2>
        <p className="mt-1 text-sm text-gray-600">
          請點擊左側導航欄，並依照步驟開始製作.。
        </p>
        <div className="flex justify-end">
          <button className=" text-neutral-50 font-bold text-sm 2xl:font-semibold 2xl:text-base px-1 py-1 rounded-md transition ease-in-out bg-[#4ECDC5] hover:-translate-y-1  hover:scale-110 duration-100 ...">
            任務完成
          </button>
        </div>
      </div>
      <div className="pt-2">
        <section className=" left-[37px] flex flex-col items-start justify-start gap-[1px] text-left text-mini text-cyan-500 font-inter">
          <div className="w-full flex gap-[2px] justify-around">
            <div
              className={
                getStageColor("1") +
                " rounded text-white font-semibold flex items-center h-[30px] min-w-[30px] px-1"
              }
            >
              同理
            </div>
            <div
              className={
                getStageColor("2") +
                " rounded text-white font-semibold flex items-center h-[30px] min-w-[30px] px-1"
              }
            >
              定義
            </div>
            <div
              className={
                getStageColor("3") +
                " rounded text-white font-semibold flex items-center h-[30px] min-w-[30px] px-1"
              }
            >
              發想
            </div>
            <div
              className={
                getStageColor("4") +
                " rounded text-white font-semibold flex items-center h-[30px] min-w-[30px] px-1"
              }
            >
              原型
            </div>
            <div
              className={
                getStageColor("5") +
                " rounded text-white font-semibold flex items-center h-[30px] min-w-[30px] px-1"
              }
            >
              測試
            </div>
          </div>

          <div className="w-full flex flex-row items-start justify-start py-0  box-border text-lg text-gray">
            <div className="flex-1 flex flex-col items-start justify-start  w-full">
              {/* <div className="w-[90px] h-4 relative">
                <div className="absolute top-[14px] left-[0px] box-border w-[92px] h-0.5 z-[2] border-t-[2px] border-solid border-gainsboro" />
                <div className="absolute top-[0px] left-[0px] box-border w-0.5 h-[17px] z-[3] border-r-[2px] border-solid border-gainsboro" />
              </div> */}
              <div className=" self-stretch flex flex-row items-start justify-start w-full">
                <div className=" flex-1 flex flex-col items-center justify-start ">
                  {/* <div key={index} className="flex flex-col items-center justify-center">
                    <div className="bg-[#4ECDC5] h-[14px] w-[14px] rounded-full z-[2]" />
                    <div className="relative leading-[21px] font-semibold z-[1] text-base">
                      原型製作
                    </div>
                    <div className="bg-slate-300 w-[2px] h-9 z-[2]" />
                  </div> */}
                  {currentSubStages.length > 0 ? (
                        currentSubStages.map((subStageId, index) => {
                            const isActiveSubStage = `${currentStage}-${currentSubStage}` === subStageId;
                            return (
                                <div key={index} className="flex flex-col items-center justify-center">
                                    <div className="bg-slate-300 w-[2px] h-9"></div>
                                    <div className="flex flex-col items-center justify-center">
                                        <div className={`${getBackgroundColor(subStageId)} h-[14px] w-[14px] rounded-full`}></div>
                                        <div className={`${getTextColor(subStageId)} text-base font-semibold`}>
                                            {stagesMap[subStageId]}
                                        </div>
                                        {isActiveSubStage && inProgressTasks.map((task, taskIndex) => (
                                            <div key={taskIndex} className="flex flex-col w-full items-end justify-end">
                                                {taskIndex === 0 && (
                                                    <div className="w-[80px] h-4 relative">
                                                        <div className="absolute top-[14px] left-[0px] box-border w-[80px] h-0.5 z-[2] border-t-[2px] border-solid border-gainsboro" />
                                                        <div className="absolute top-[0px] left-[0px] box-border w-0.5 h-[17px] z-[3] border-r-[2px] border-solid border-gainsboro" />
                                                    </div>
                                                )}
                                                <div className="bg-slate-300 w-[2px] h-9"></div>
                                                
                                                

                                                <div className={`h-[10px] w-[10px] pl-3 rounded-full ${taskIndex === 0 ? 'bg-[#4ECDC5]' : 'bg-slate-400'}`}></div>
                                                <div className={` text-xs text-center ${taskIndex === 0 ? 'text-[#4ECDC5]' : 'text-slate-400'}`}>
                                                    <span className="pl-20">{task.content}</span>
                                                </div>
                                                {taskIndex === inProgressTasks.length - 1 && (
                                                    <div className="w-[60px] h-4 relative">
                                                        <div className="absolute top-[0px] left-[0px] box-border w-[60px] h-[17px] z-[3] border-r-[2px] border-solid border-gainsboro" />
                                                        <div className="absolute top-[14px] left-[-20px] box-border w-[80px] h-0.5 z-[2] border-t-[2px] border-solid border-gainsboro" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-500">
                            No sub-stages available for this stage.
                        </p>
                    )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Scaffolding;
