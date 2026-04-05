"use client";
import React, { useState } from 'react'
import NotificationModal from './NotificationModal';

const ChatButton = ({icon} : { icon : any}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="hover:bg-white/20 rounded-full flex-center transition-all
            duration-300 cursor-pointer p-3">
        {icon}
      </div>

      {
        isModalOpen && <NotificationModal setIsModalOpen={setIsModalOpen} />
      }
    </>
  );
};

export default ChatButton;