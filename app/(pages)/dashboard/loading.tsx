import React from "react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div
        className="animate-spin inline-block w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;
