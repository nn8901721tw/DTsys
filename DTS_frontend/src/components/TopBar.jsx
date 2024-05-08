import React, { useState, useEffect } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { BsChevronDown, BsPlusCircleDotted } from "react-icons/bs";
import { getProjectUser } from "../api/users";
import { getProject } from "../api/project";
import { useQuery } from "react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { GrFormClose } from "react-icons/gr";
import Modal from "./Modal";
import { BsPersonCircle } from "react-icons/bs";
import Swal from 'sweetalert2';
import { FaCrown } from "react-icons/fa";
import { FaRibbon } from "react-icons/fa";

export default function TopBar() {
  const [projectUsers, setProjectUsers] = useState([{ id: "", username: "" }]);
  const [projectInfo, setProjectInfo] = useState({});
  const [referralCodeModalOpen, setReferralCodeModalOpen] = useState(false);
  const { projectId } = useParams();
  const [userId, setUserId] = useState(
    localStorage.getItem("id")
  );
  const [teamLeader, setTeamLeader] = useState(
    localStorage.getItem("teamLeader")
  );
  const [nickname, setNickname] = useState(
    localStorage.getItem("nickname")
  );
  const navigate = useNavigate();

  const getProjectUserQuery = useQuery(
    "getProjectUser",
    () => getProjectUser(projectId),
    {
      onSuccess: setProjectUsers,
      enabled: !!projectId,
    }
  );

  const getProjectQuery = useQuery("getProject", () => getProject(projectId), {
    onSuccess: (data) => {
      setProjectInfo(data);
      localStorage.setItem("currentStage", data.currentStage);
      localStorage.setItem("currentSubStage", data.currentSubStage);
      localStorage.setItem("name", data.name);
      localStorage.setItem("ProjectEnd", data.ProjectEnd);
      localStorage.setItem("teamLeader", data.teamLeader);
    },
    enabled: !!projectId,
  });

     // 找出用户在数组中的索引
     const userIndex = projectUsers.findIndex(user => user.id === parseInt(userId));

  const cleanStage = () => {
    localStorage.removeItem("currentStage");
    localStorage.removeItem("currentSubStage");
    localStorage.removeItem("name");
    localStorage.removeItem("stageEnd");
    localStorage.removeItem("ProjectEnd");
    localStorage.removeItem("taskSubmitted");
    localStorage.removeItem("teamLeader");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const colors = ["bg-[#C47D09]", "bg-[#D2B800]", "bg-[#578082]", "bg-[#16A34A]", "bg-[#115E59]","bg-[#4ECDC5]"];


  console.log("projectUsers::::" ,projectUsers);


  const handleShowReferralCode = () => {
    Swal.fire({
      title: '<h3 style="font-size: 28px;">組隊邀請碼:</h3>',
      html: `

        <div style="background-color: #47a8bd; color: white; padding: 10px; border-radius: 6px; margin-top: 10px;">
          ${projectInfo.referral_code}
        </div>
      `,
      confirmButtonText: '關閉',
      confirmButtonColor: '#5698A0',
      focusConfirm: false,
      customClass: {
        popup: 'custom-swal'
      }
    });
  };


  return (
    <div className="fixed h-16 w-full pl-20 bg-[#b2dbdb] flex items-center justify-between pr-5 border-b-2 text-slate-700 font-bold z-30">
      <Link to="/lobypage" onClick={cleanStage} className="">
        <img src="/images/DTlabel.png" className="w-40 mt-1" />
      </Link>

      

      <div className="div bg-[#0E7490]"></div>
      <div className="flex items-center">
        <ul className="flex items-center justify-center space-x-1">
          {getProjectUserQuery.isLoading || projectId === undefined ? (
            <></>
          ) : getProjectUserQuery.isError ? (
            <p className=" font-bold text-2xl">{kanbansIsError.message}</p>
          ) : (
            projectUsers.map((projectUser, index) => {
              const bgColor = colors[(projectUser.id - 1) % colors.length]; // 使用用户 ID 取模来获取颜色
              const isTeamLeader = projectUser.id.toString() === localStorage.getItem("teamLeader"); // 檢查是否為組長
              return (
                <div key={index} className="relative group">
                  <div
                    className={`${bgColor} -mx-1 rounded-full flex items-center justify-center shadow-lg cursor-default relative`}
                  >
                    {isTeamLeader && <FaCrown className="absolute -top-3 text-[#fae848] text-lg" />}
                    <BsPersonCircle className="w-8 h-8 text-white" />
                  </div>
                  {/* Tooltip */}
                  <div className="transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-y-1 group-hover:scale-105 hidden group-hover:block ease-in-out transform">
                    <div
                      className={`${bgColor} w-14 text-center absolute text-white text-xs rounded-lg p-2 z-10`}
                    >
                      {projectUser.nickname}
                    </div>
                  </div>
                </div>
              );
            })
            
          )}
          
          {getProjectUserQuery.isLoading || projectId === undefined ? (
            <></>
          ) : (
            <li>
            <button className="flex items-center w-9 h-9 justify-center">
              <BsPlusCircleDotted
                size={32}
                className=" text-gray-500"
                onClick={handleShowReferralCode}
             
              />
            </button>

          </li>
          ) }  
        </ul>


        <h3 className="font-bold cursor-default p-1 mr-2 rounded-lg">
          {localStorage.getItem("nickname")}
        </h3>
        <h3
          className="font-bold cursor-pointer p-1 mr-2 hover:bg-teal-800 hover:text-slate-100 rounded-lg"
          onClick={handleLogout}
        >
          登出
        </h3>
      </div>

    </div>
  );
}
