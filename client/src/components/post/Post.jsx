import React, { useState, useEffect, useContext } from "react";
import { BsThreeDots, BsReply } from "react-icons/bs";
import {
  AiOutlineComment,
  AiOutlineLike,
  AiOutlineShareAlt,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import date from "date-and-time";
import { CSSTransition } from "react-transition-group";

import usePost from "../../hooks/usePost";
import Alert from "../alert/Alert";
import { AuthContext } from "../../context/AuthContext";
import "./post.scss";

function Post({ post, onDeletePost, onLoad, onLoadSingle, postDetailMain }) {
  const { user } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const {
    comments,
    loadedComments,
    currentPost,
    handleLike,
    handleFollow,
    deletePost,
    getLink,
  } = usePost(post);

  // let parent element know when comments are loaded
  useEffect(() => {
    if (loadedComments) {
      onLoad && onLoad((prev) => [...prev, post]);
      onLoadSingle && onLoadSingle(true);
    }
  }, [loadedComments, onLoad, onLoadSingle, post]);

  function handleAlert() {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 2000);
  }

  return (
    <>
      <div className="post__wrapper">
        {loadedComments && (
          <>
            {post.replyTo && (
              <span className="post__replyto">
                <Link
                  to={`/home/post/${post.replyTo._id}`}
                  style={{ color: "unset", textDecoration: "none" }}
                >
                  In reply to @{post.replyTo.author.username} <BsReply />
                </Link>
              </span>
            )}
            <div className="post">
              <div>
                <Link to={`/home/profile/${post.authorId}`}>
                  <img
                    className="post__user__image"
                    src={
                      post.author?.profilePic
                        ? `/images/profile/${post.author.profilePic}`
                        : "/defaultProfilePicture.jpg"
                    }
                    alt=""
                  />
                </Link>
              </div>
              <div className="post__body">
                <div className="post__top">
                  <div className="post__user__info">
                    <span>
                      <Link
                        to={`/home/profile/${post.author?._id}`}
                        style={{ color: "unset", textDecoration: "none" }}
                      >
                        <p className="post__user__name">
                          @{post.author?.username}
                        </p>
                      </Link>
                      <p className="post__user__message">
                        {currentPost?.message}
                      </p>
                    </span>
                  </div>
                  <span className="post__menu__button">
                    <BsThreeDots
                      onClick={() => {
                        setMenuOpen(!menuOpen);
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  </span>
                  {menuOpen && (
                    <div className="post__menu">
                      <ul>
                        {user._id === post.authorId && (
                          <li
                            onClick={() => {
                              deletePost(postDetailMain, onDeletePost, onLoad);
                            }}
                          >
                            Delete Post
                          </li>
                        )}
                        {user._id !== post.authorId && (
                          <li onClick={() => handleFollow()}>
                            {user.following.includes(post.authorId)
                              ? `Unfollow ${post.author.username}`
                              : `Follow ${post.author.username}`}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {currentPost.media && (
                  <div className="post__image">
                    <img src={`/images/posts/${currentPost.media}`} alt="" />
                  </div>
                )}

                <div className="post__bottom">
                  <span>
                    <Link
                      to={`/home/post/${post._id}`}
                      style={{ color: "unset", textDecoration: "none" }}
                    >
                      <AiOutlineComment />
                      <span className="post__stat">{comments.length}</span>
                    </Link>
                  </span>

                  <span
                    onClick={() => {
                      handleLike();
                    }}
                    className={`${
                      currentPost.likes.includes(user._id) && "post__liked"
                    }`}
                  >
                    <AiOutlineLike />
                    <span className="post__stat">
                      {currentPost.likes.length}
                    </span>
                  </span>
                  <span
                    onClick={() => {
                      getLink();
                      handleAlert();
                    }}
                  >
                    <AiOutlineShareAlt />
                  </span>
                </div>
                <div className="post__date">
                  <p>
                    {date.format(new Date(currentPost.createdAt), "HH:mm:ss")}
                    &nbsp; · &nbsp;
                    {date.format(new Date(currentPost.createdAt), "YYYY/MM/DD")}
                  </p>
                </div>
              </div>

              {menuOpen && (
                <div
                  className="post__menu__overlay"
                  onClick={() => {
                    setMenuOpen(false);
                  }}
                ></div>
              )}
            </div>
          </>
        )}

        <Link to={`/home/post/${post._id}`}>
          <div className="post__overlay"></div>
        </Link>
      </div>
      <CSSTransition
        in={showAlert}
        timeout={5000}
        classNames="alert"
        unmountOnExit
      >
        <Alert message="Copied link to clipboard" />
      </CSSTransition>
    </>
  );
}

export default Post;
