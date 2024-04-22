import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import {
    FiEdit,
    FiTrash,
    FiShare,
    FiPlusSquare,
  } from "react-icons/fi";

const AnimatedDropdown = ({ handleSortChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('未完成');
  const options = ['未完成', '已完成', '依時間'];
  const onSelectOption = (option) => {
    setSelectedOption(option);
    handleSortChange(option);
    setOpen(false);
  };


  const wrapperVariants = {
    open: {
      scaleY: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
    closed: {
      scaleY: 0,
      transition: {
        when: 'afterChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
    },
    closed: {
      opacity: 0,
      y: -10,
    },
  };

  return (
    <div className="relative inline-block shadow-xl bg-stone-100 rounded-lg">
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-md  text-gray-800"
      >
        <span>{selectedOption}</span>
        <FiChevronDown />
      </motion.button>
      {open && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={wrapperVariants}
          className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10"
        >
          {options.map((option, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ backgroundColor: '#EBF4FF' }}
              className="px-4 py-2 cursor-pointer"
              onClick={() => onSelectOption(option)}
            >
              {option}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedDropdown;
