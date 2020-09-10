import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const Like = ({ liked, onClick }) => {
  if (liked)
    return (
      <FaHeart
        onClick={onClick}
        style={{ cursor: "pointer" }}
        aria-hidden="true"
      />
    );
  return (
    <FaRegHeart
      onClick={onClick}
      style={{ cursor: "pointer" }}
      aria-hidden="true"
    />
  );
};

export default Like;
