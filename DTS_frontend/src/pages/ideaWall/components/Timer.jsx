import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { MdAlarm } from "react-icons/md";
import Timer_icon from "../../../assets/AnimationTimer.json";
import Lottie from "lottie-react";

const Timer = () => {
  const [totalTime, setTotalTime] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (isActive && seconds > 0) {
      const intervalId = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    } else if (seconds === 0 && isActive) {
      completeTimer();
    }
  }, [seconds, isActive]);

  const completeTimer = () => {
    setIsActive(false);
    Swal.fire({
      title: "時間到!",
      text: "設定的時間已結束，請盡速結束討論，進入下個階段。",
      icon: 'success',
      showConfirmButton: true,
      confirmButtonColor: "#0891B2",  // 设置确认按钮颜色
    
    });
    
  };

  const handleSetTime = async () => {
    const { value: result } = await Swal.fire({
      title: "設定時間",
      html: `
        <input id="minutes" type="number" min="0" max="59" step="1" value="0" class="swal2-input" placeholder="分鐘"> <span> 分鐘</span>
        <input id="seconds" type="number" min="0" max="59" step="1" value="0" class="swal2-input" placeholder="秒數"> <span> 秒鐘</span>
      `,
      focusConfirm: false,
      showConfirmButton: true,
      confirmButtonColor: "#0891B2",  // 设置确认按钮颜色
      preConfirm: () => {
        const minutes = Swal.getPopup().querySelector("#minutes").value;
        const seconds = Swal.getPopup().querySelector("#seconds").value;
        return {
          minutes: minutes,
          seconds: seconds,
        };
      },
    });

    if (result && result.minutes != null && result.seconds != null) {
      const totalSecs =
        parseInt(result.minutes) * 60 + parseInt(result.seconds);
      setSeconds(totalSecs);
      setTotalTime(totalSecs);
      setIsActive(true);
    }
  };

  const progressWidth =
    totalTime > 0 ? `${(seconds / totalTime) * 100}%` : "0%";

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
  };
  return (
    <div className="fixed bottom-4 left-20">
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleSetTime}
        className="fixed bottom-28 left-[5.3rem] flex items-center justify-center text-base " // 添加 relative 使得圆形可以正确定位
        aria-label="設定討論時間"
      >
        {/* 圆形背景 */}
        <div className="absolute h-12 w-12 bg-[#c6cccc] rounded-full"></div>
        <Lottie className="w-14" animationData={Timer_icon} loop={isActive || hovering} />
      </button>

      {isActive && (
        <div className="fixed bottom-[7.5rem] left-[10rem]">
          <div className="timer-display font-bold text-[#627c7c]">
            剩餘時間: {Math.floor(seconds / 60)}:
            {String(seconds % 60).padStart(2, "0")}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
            <div
              className="bg-[#90bbbb] h-1.5 rounded-full transition-width duration-1000 ease-in-out"
              style={{ width: progressWidth }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );

};

export default Timer;
