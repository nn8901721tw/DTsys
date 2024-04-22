import React from 'react';
import { TypeAnimation } from "react-type-animation";
import { motion, AnimatePresence } from 'framer-motion';

const SlideInNotifications = ({ notifications, setNotifications }) => {
  return (
    <AnimatePresence>
      <div className="absolute bottom-12 left-80 flex flex-col gap-1 w-96 mb-10 z-50 pointer-events-none font-semibold text-teal-800 ">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ y: -50, opacity: 0 }}  // Start above the final position
            animate={{ y: 0, opacity: 1 }}   // Animate to final position
            exit={{ y: 50, opacity: 0 }}     // Exit towards below
            transition={{ duration: 5 }}
            className="bg-transparent rounded px-4 py-2"
            onAnimationComplete={() => setNotifications([])}  // Clear notifications after all animations
          >
            <TypeAnimation
              sequence={[
                notification.text,
                3000,  // Stay on screen for 3000ms
                ''     // Empty string to hide text after showing
              ]}
              speed={40}
              wrapper="span"
              cursor={true}
              repeat={0}  // Repeat 0 times, just run once
              style={{ color: 'black', fontSize: '1.3em' }}
            />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};

export default SlideInNotifications;
