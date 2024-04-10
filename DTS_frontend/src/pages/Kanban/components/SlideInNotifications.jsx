import React, { useEffect } from "react";
import { FiCheckSquare, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

const SlideInNotifications = ({ notifications, setNotifications }) => {
  const removeNotif = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return (
    <div className="absolute bottom-0 left-72 2xl:left-96 2xl:bottom-44 flex flex-col gap-1 w-56 2xl:w-72 mb-10 ml-10 z-50 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <Notification key={notification.id} notification={notification} removeNotif={removeNotif} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const NOTIFICATION_TTL = 15000;

const Notification = ({ notification, removeNotif }) => {
  useEffect(() => {
    const timeoutRef = setTimeout(() => {
      removeNotif(notification.id);
    }, NOTIFICATION_TTL);

    return () => clearTimeout(timeoutRef);
  }, [notification.id, removeNotif]);

  return (
    <motion.div
      layout
      initial={{ x: 0, scale: 0.95 }}
      animate={{ y: 0, scale: 1.5 }}
      exit={{ x: "50%", opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-lg p-2 flex items-start  gap-2 text-xs font-medium shadow-lg text-white bg-sky-700 pointer-events-auto"
    >
      <FiCheckSquare className="mt-0.5" />
      <span>{notification.text}</span>
      <button onClick={() => removeNotif(notification.id)} className="ml-auto mt-0.5">
        <FiX />
      </button>
    </motion.div>
  );
};

export default SlideInNotifications;
