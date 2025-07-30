import React from "react";

interface NewChatButtonProps {
  onNewChat: () => void;
}

const insertChatEntryIntoDB = async () => {};

export const NewChatButton: React.FC<NewChatButtonProps> = ({ onNewChat }) => {
  const handleClick = () => {
    console.log("New Chat button clicked");
    onNewChat();
  };
  insertChatEntryIntoDB();

  return (
    <div className="p-4">
      <button
        onClick={handleClick}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
      >
        New Chat
      </button>
    </div>
  );
};
