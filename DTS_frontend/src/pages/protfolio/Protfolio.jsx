import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AiTwotoneFolderAdd } from "react-icons/ai";
import { useQuery } from "react-query";
import { getAllSubmit } from "../../api/submit";
import Loader from "../../components/Loader";
import DragCloseModal from "./components/DragCloseModal";

export default function Portfolio() {
  const [groupedPortfolio, setGroupedPortfolio] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const { projectId } = useParams();

  const { isLoading, isError, data } = useQuery(
    "portfolioDatas",
    () => getAllSubmit({ params: { projectId } }),
    {
      onSuccess: (data) => {
        const groupedData = data.reduce((acc, item) => {
          const prefix = item.stage.split('-')[0];
          if (!acc[prefix]) {
            acc[prefix] = [];
          }
          acc[prefix].push(item);
          return acc;
        }, {});
        setGroupedPortfolio(groupedData);
      },
    }
  );

  const titles = {
    "1": "同理",
    "2": "定義",
    "3": "發想",
    "4": "原型",
    "5": "測試",
  };
  const stagesMap = {
    "1-1": "經驗分享與同理",
    "1-2": "定義利害關係人",
    "1-3": "進場域前的同理",
    "1-4": "歸類需求與問題",
    "2-1": "定義問題",
    "2-2": "投票",
    "3-1": "問題聚焦",
    "3-2": "篩選與整合方法",
    "4-1": "原型製作",
    "5-1": "原型測試與分析",
    "5-2": "開始修正",
  };
  return (
    <div className="min-w-full h-screen overflow-y-auto scrollbar-thin">
      <div className="flex flex-col my-5 pl-20 pr-5 sm:px-32 py-16 justify-start items-start ">
        {Object.keys(titles).map((prefix) => (
          <div key={prefix}>
            <h3 className="text-3xl font-bold mb-2 ml-4">{titles[prefix]}</h3>
            <hr className='w-full h-[3px] my-2 rounded-xl bg-gray-200 border-0 dark:bg-gray-700'/>
            <div className="flex flex-nowrap w-full mb-5">
              {groupedPortfolio[prefix] && groupedPortfolio[prefix].length > 0 ? (
                groupedPortfolio[prefix].map((item) => (
                  <div className="flex-shrink-0 mx-3" key={item.id}>
                    <button
                      className="h-24 w-64 inline-flex items-center bg-white hover:bg-slate-200/80 text-slate-600 border-2 border-slate-200 font-semibold rounded-md p-1 mt-3 sm:px-4 text-base min-w-[100px]"
                      onClick={() => {
                        setModalOpen(true);
                        setModalData(item);
                      }}
                    >
                      <AiTwotoneFolderAdd size={32} className="text-black mr-1" />
                      <span>{item.stage} {stagesMap[item.stage]}</span>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xl text-gray-500">尚未上傳任何學習歷程</p>
              )}
            </div>
          </div>
        ))}
        {modalOpen && (
          <DragCloseModal open={modalOpen} setOpen={setModalOpen}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">{modalData.stage} {stagesMap[modalData.stage]}</h2>
              {modalData.content ? (
                Object.entries(JSON.parse(modalData.content)).map(
                  ([key, value], index) => (
                    <div key={index} className="mb-2">
                      <span className="font-bold">{key}: </span>
                      <span>{value}</span>
                    </div>
                  )
                )
              ) : (
                <p>No data available.</p>
              )}
            </div>
          </DragCloseModal>
        )}
      </div>
    </div>
  );
}
