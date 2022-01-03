import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import date from "date-and-time";

import { AuthContext } from "../../context/AuthContext";
import Searchbar from "../../components/searchbar/Searchbar";

import "./messages.scss";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function getConversations() {
      try {
        const res = await axios.get(`/api/conversations/user/${user._id}`);
        setConversations(res.data.conversations);
      } catch (err) {
        console.log(err);
      }
    }
    getConversations();
  }, []);

  return (
    <div className="messages">
      <div className="layout__heading">
        <h2>Messages</h2>
      </div>
      <div className="messages__searchbar">
        <Searchbar location="messages" placeholder="Search Users" />
      </div>
      <div className="messages__list">
        {conversations.map((conversation) => {
          return (
            <Link
              to={`${conversation._id}`}
              style={{ textDecoration: "none", color: "unset" }}
            >
              <div className="message">
                <div className="message__user">
                  <img
                    className="message__user__profilePic"
                    src={
                      user._id === conversation.user1._id
                        ? conversation.user2.profilePic
                          ? `/images/profile/${conversation.user2.profilePic}`
                          : "/defaultProfilePicture.jpg"
                        : conversation.user1.profilePic
                        ? `/images/profile/${conversation.user1.profilePic}`
                        : "/defaultProfilePicture.jpg"
                    }
                    alt=""
                  />
                  <div className="message__user__info">
                    <p className="message__user__name">
                      {conversation.user1._id === user._id
                        ? conversation.user2.username
                        : conversation.user1.username}
                    </p>
                    <p className="message__last-message">
                      {conversation.messages.length > 0 &&
                        conversation.messages[conversation.messages.length - 1]
                          .content}
                    </p>
                  </div>
                </div>
                <p className="message__date">
                  {date.format(new Date(conversation.updatedAt), "MMM DD")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Messages;
