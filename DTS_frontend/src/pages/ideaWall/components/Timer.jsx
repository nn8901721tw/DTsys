import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { MdAlarm } from 'react-icons/md';

const Timer = () => {
  const [totalTime, setTotalTime] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && seconds > 0) {
      const intervalId = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    } else if (seconds === 0 && isActive) {
      completeTimer();
    }
  }, [seconds, isActive]);

  const completeTimer = () => {
    setIsActive(false);
    Swal.fire({
      title: '時間到!',
      text: '您設定的時間已經結束。',
      icon: 'success'
    });
  };

  const handleSetTime = async () => {
    const { value: result } = await Swal.fire({
      title: '設定時間',
      html: `
        <input id="minutes" type="number" min="0" max="59" step="1" value="0" class="swal2-input" placeholder="分鐘"> <span> 分鐘</span>
        <input id="seconds" type="number" min="0" max="59" step="1" value="0" class="swal2-input" placeholder="秒數"> <span> 秒鐘</span>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const minutes = Swal.getPopup().querySelector('#minutes').value;
        const seconds = Swal.getPopup().querySelector('#seconds').value;
        return {
          minutes: minutes,
          seconds: seconds
        };
      }
    });

    if (result && result.minutes != null && result.seconds != null) {
      const totalSecs = parseInt(result.minutes) * 60 + parseInt(result.seconds);
      setSeconds(totalSecs);
      setTotalTime(totalSecs);
      setIsActive(true);
    }
  };

  const progressWidth = totalTime > 0 ? `${(seconds / totalTime) * 100}%` : '0%';

  return (
    <div className="fixed bottom-4 left-20">
      <button className="flex items-center gap-2 bg-[#4b7fbb]  hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleSetTime}>
        <MdAlarm />
        設定時間
      </button>
      {isActive && (
        <>
          <div className="timer-display">
            剩餘時間: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
            <div className="bg-blue-200 h-1.5 rounded-full transition-width duration-1000 ease-in-out" style={{ width: progressWidth }}></div>
          </div>
        </>
      )}
    </div>
  );
};

export default Timer;