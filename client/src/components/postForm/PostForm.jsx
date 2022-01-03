import React, { useState, useContext } from "react";
import Picker from "emoji-picker-react";
import { BsCardImage } from "react-icons/bs";
import { GrEmoji } from "react-icons/gr";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import "./postForm.scss";
import axios from "axios";

function PostForm({
  closeModal,
  feed,
  id,
  onCreatePost,
  placeholder,
  replyId,
  authorId,
  inModal,
}) {
  const [post, setPost] = useState("");
  const [file, setFile] = useState(null);
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject.emoji);
    setPost((prev) => prev + emojiObject.emoji);
  };

  function handleFile(e) {
    setFile(e.target.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let res;
    try {
      const bodyFormData = new FormData();
      bodyFormData.append("message", post);
      bodyFormData.append("media", file);
      if (replyId) {
        res = await axios.post(`/api/posts/${replyId}/comment`, bodyFormData);
        if (user._id !== authorId) {
          await axios.post(`/api/users/notifications/${authorId}`, {
            type: "commented on your post",
            post: replyId,
          });
        }
      } else {
        res = await axios.post("/api/posts", bodyFormData);
      }

      if (res.statusText === "OK") {
        onCreatePost && onCreatePost(res.data.createdPost);
        setPost("");
        setFile(null);
        closeModal && closeModal();
        if (location.pathname === "/home" && closeModal) {
          window.location.reload();
        } else if (!location.pathname.includes("/post/") || inModal) {
          navigate("/home");
        }
      } else {
        console.log("Not Posted");
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <form className={`postForm ${feed && "postForm__feed"}`}>
        <textarea
          className={`${feed && "textarea-feed"}`}
          maxLength="280"
          value={post}
          onChange={(e) => {
            setPost(e.target.value);
          }}
          placeholder={`${placeholder || "What's happening?"}`}
        />
        <input
          accept=".jpg, .jpeg, .png, .gif"
          onChange={handleFile}
          id={`fileUpload-${id}`}
          type="file"
          onClick={(e) => (e.target.value = "")}
        />
        {file && (
          <div className="postForm__imagePreview">
            <img className="shareImg" src={URL.createObjectURL(file)} alt="" />
            <span
              onClick={() => {
                setFile(null);
              }}
              className="removeImg"
            >
              <AiOutlineClose />
            </span>
          </div>
        )}
        <hr className="postForm__rule" />
        <div className="postForm__bottom">
          <div className="postForm__buttons">
            <label htmlFor={`fileUpload-${id}`}>
              <span>
                <BsCardImage />
              </span>
            </label>
            <span
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
              }}
            >
              <GrEmoji />
            </span>
          </div>
          <button
            onClick={(e) => {
              handleSubmit(e);
            }}
            className="postForm__submitButton"
          >
            Share
          </button>
        </div>
      </form>
      <div className="emojiPicker">
        {showEmojiPicker && (
          <div
            onClick={() => {
              setShowEmojiPicker(false);
            }}
            className="emojiPicker__overlay"
          ></div>
        )}
        {showEmojiPicker && (
          <div className="emojiPicker__menu">
            <Picker onEmojiClick={onEmojiClick} />
          </div>
        )}
      </div>
    </>
  );
}

export default PostForm;
