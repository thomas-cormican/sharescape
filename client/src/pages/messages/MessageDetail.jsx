import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import date from "date-and-time";
import { Link } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import "./messageDetail.scss";

function MessageDetail() {
  const [toUser, setToUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { user } = useContext(AuthContext);
  const conversationId = useParams().conversationId;
  const socketRef = useRef();

  useEffect(() => {
    var elem = document.getElementById("messages__container");
    axios.get(`/api/conversations/${conversationId}`).then((res) => {
      user && user._id === res.data.conversation.user1._id
        ? setToUser(res.data.conversation.user2)
        : setToUser(res.data.conversation.user1);
      setMessages(res.data.conversation.messages);
      elem.scrollTop = elem.scrollHeight;
    });

    socketRef.current = io.connect("/");

    socketRef.current.on("message", (receivedData) => {
      receiveMessage(receivedData);
      elem.scrollTop = elem.scrollHeight;
    });
  }, []);

  function receiveMessage(data) {
    if (data.conversationId === conversationId) {
      setMessages((prev) => [...prev, data.message]);
    }
  }

  function sendMessage(e) {
    e.preventDefault();
    axios
      .put(`/api/conversations/${conversationId}`, { message })
      .then((res) => {
        setMessage("");
        socketRef.current.emit("send message", {
          message: res.data.message,
          conversationId,
        });
      });
  }
  return (
    <div className="messageDetail">
      <div className="layout__heading">
        <Link
          to={`/home/profile/${toUser._id}`}
          style={{ textDecoration: "none", color: "unset" }}
        >
          <h2>{toUser?.username}</h2>
        </Link>{" "}
      </div>
      <div id="messages__container" className="messageDetail__messages">
        {messages.map((messageio) => {
          return (
            <div
              className={`messageDetail__message ${
                user._id === messageio.from._id
                  ? "messageDetail__message--user1"
                  : "messageDetail__message--user2"
              }`}
            >
              <div className="messageDetail__message__wrapper">
                <div
                  className={`messageDetail__message__content ${
                    user._id === messageio.from._id
                      ? "messageDetail__message__content--user1"
                      : "messageDetail__message__content--user2"
                  }`}
                >
                  <p className="messageDetail__message__content__text">
                    {messageio.content}
                  </p>
                  <p className="messageDetail__message__content__date">
                    {date.format(
                      new Date(messageio.createdAt),
                      "MMM D, YYYY, h:mm A"
                    )}
                  </p>
                </div>
                <img
                  className={`messageDetail__message__image ${
                    user._id === messageio.from._id
                      ? "messageDetail__message__image--user1"
                      : "messageDetail__message__image--user2"
                  }`}
                  src={
                    user._id === messageio.from._id
                      ? user.profilePic
                        ? `/images/profile/${user.profilePic}`
                        : "/defaultProfilePicture.jpg"
                      : toUser?.profilePic
                      ? `/images/profile/${toUser.profilePic}`
                      : "/defaultProfilePicture.jpg"
                  }
                  alt=""
                />
              </div>
            </div>
          );
        })}{" "}
      </div>
      <form className="messageDetail__input-area">
        <input
          type="text"
          value={message}
          placeholder="Type your message here"
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        ></input>

        <button
          disabled={message.length <= 0 ? true : false}
          onClick={(e) => sendMessage(e)}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default MessageDetail;
