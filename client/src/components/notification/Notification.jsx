import React from "react";
import date from "date-and-time";
import { AiOutlineComment, AiOutlineLike } from "react-icons/ai";
import { BsPersonPlus } from "react-icons/bs";
import { Link } from "react-router-dom";

import "./notification.scss";

function Notification({ notification }) {
  return (
    <Link
      to={
        notification.post
          ? `/home/post/${notification.post}`
          : `/home/profile/${notification.from._id}`
      }
      style={{ textDecoration: "none", color: "unset" }}
    >
      <div className="notification">
        <div className="notification__type__icon">
          {notification.type === "followed you" && <BsPersonPlus />}
          {notification.type === "commented on your post" && (
            <AiOutlineComment />
          )}
          {notification.type === "liked your post" && <AiOutlineLike />}
        </div>
        <div className="notification__details">
          <img
            className="notification__user__image"
            src={
              notification.from.profilePic
                ? `/images/profile/${notification.from.profilePic}`
                : `/defaultProfilePicture.jpg`
            }
            alt=""
          />
          <p className="notification__message">
            <span className="notification__user__name">
              {notification.from.username}{" "}
            </span>
            {notification.type}
          </p>
          <p className="notification__date">
            {date.format(new Date(notification.createdAt), "ddd DD MMMM")}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default Notification;
