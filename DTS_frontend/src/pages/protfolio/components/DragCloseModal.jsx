import React from "react";
import useMeasure from "react-use-measure";
import { useDragControls, useMotionValue, motion, AnimatePresence } from "framer-motion";

const DragCloseModal = ({ open, setOpen, children }) => {
  const [drawerRef, { height }] = useMeasure();
  const y = useMotionValue(0);
  const controls = useDragControls();

  const handleClose = () => {
    setOpen(false);
  };

  const handleDragEnd = () => {
    // 如果拖动超过100像素则关闭模态框
    if (y.get() < 100) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 bg-neutral-950/70"
        >
          <motion.div
            id="drawer"
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ ease: "easeInOut" }}
            className="absolute bottom-0 w-11/12 left-20 overflow-hidden rounded-t-3xl bg-[#a3b4b6]"
            style={{ y }}
            drag="y"
            dragControls={controls}
            onDragEnd={handleDragEnd}
            dragConstraints={{ top: 0, bottom: 0 }}
          >
            <div className="absolute left-0 right-0 top-0 z-10 flex justify-center bg-[#bdc7bd2a] p-4">
              <div
                className="h-2 w-14 rounded-full bg-neutral-700"
                onPointerDown={(e) => controls.start(e)}
                style={{ cursor: 'grab' }}
              ></div>
            </div>
            <div className="relative z-0 h-full overflow-y-scroll p-4 pt-12 text-2xl text-neutral-200">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DragCloseModal;
