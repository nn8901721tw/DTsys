import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";
import CommonInput from "../../submit/components/CommonInput"; // 確保路徑正確
import { useState } from "react";
import { useMutation } from "react-query";
import { submitTask } from "../../../api/submit";
import toast from "react-hot-toast";

const SpringModal = ({
  isOpen,
  setIsOpen,
  projectId,
  stageInfo,
  setStageInfo,
}) => {
  const [taskData, setTaskData] = useState({});
  const [attachFile, setAttachFile] = useState(null);

  const { mutate, isSuccess } = useMutation(submitTask, {
    onSuccess: (res) => {
      toast.success(res.message || "提交成功！");
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.response.data.message || "提交失敗！");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("currentStage", localStorage.getItem("currentStage"));
    formData.append("currentSubStage", localStorage.getItem("currentSubStage"));
    formData.append("content", JSON.stringify(taskData));

    if (attachFile) {
      for (let i = 0; i < attachFile.length; i++) {
        formData.append("attachFile", attachFile[i]);
      }
    }
    Object.keys(taskData).forEach((key) => {
      formData.append(key, taskData[key]);
    });
    mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setAttachFile(e.target.files);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-slate-900/20 backdrop-blur fixed inset-0 z-40 grid place-items-center cursor-pointer"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-6 rounded-lg max-w-lg shadow-xl cursor-default relative"
          >
            <div className="relative z-10 flex flex-col space-y-4">
              {stageInfo && stageInfo.userSubmit ? (
                Object.entries(stageInfo.userSubmit).map(([key, { type }]) => (
                  <CommonInput
                    key={key}
                    type={type}
                    name={key}
                    handleChange={
                      type === "file" ? handleFileChange : handleChange
                    }
                  />
                ))
              ) : (
                <p>Loading or no data available...</p>
              )}
              <button
                onClick={handleSubmit}
                className="bg-white text-indigo-600 font-semibold py-2 rounded"
              >
                上傳
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpringModal;
