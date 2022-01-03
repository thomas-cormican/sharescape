import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

export default function usePost(post) {
  const [comments, setComments] = useState([]);
  const [loadedComments, setLoadedComments] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    async function getComments() {
      try {
        const res = await axios.get(`/api/posts/${post._id}/comments`);
        setComments(res.data.comments);
        setLoadedComments(true);
      } catch (err) {
        console.log(err);
      }
    }
    getComments();
  }, []);

  async function handleLike() {
    try {
      const res = await axios.post(`/api/posts/${post._id}/like`);
      if (res.data === "Post unliked") {
        setCurrentPost((prevValue) => {
          return {
            ...prevValue,
            likes: prevValue.likes.filter((like) => like !== user._id),
          };
        });
      } else if (res.data === "Post liked") {
        if (user._id !== post.authorId) {
          await axios.post(`/api/users/notifications/${post.authorId}`, {
            type: "liked your post",
            post: post._id,
          });
        }
        setCurrentPost((prevValue) => {
          return {
            ...prevValue,
            likes: [...prevValue.likes, user._id],
          };
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function handleFollow() {
    try {
      const res = await axios.post(`/api/users/${post.authorId}/follow`);
      if (res.data === "User Followed") {
        await axios.post(`/api/users/notifications/${post.authorId}`, {
          type: "followed you",
        });
        dispatch({ type: "FOLLOW USER", payload: post.authorId });
      } else {
        dispatch({ type: "UNFOLLOW USER", payload: post.authorId });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function deletePost(location, onDelete, onLoad) {
    try {
      await axios.delete(`/api/posts/${post._id}`);
      if (location) {
        navigate("/home");
      }
      onDelete(post._id);
      onLoad((prev) => prev.filter((prevPost) => prevPost._id !== post._id));
    } catch (err) {
      console.log(err);
    }
  }

  async function getLink() {
    var text = `https://sharescapeapp.herokuapp.com/home/post/${post._id}`;
    var elem = document.createElement("textarea");
    document.body.appendChild(elem);
    elem.value = text;
    elem.select();
    document.execCommand("copy");
    document.body.removeChild(elem);
  }

  return {
    comments,
    loadedComments,
    currentPost,
    handleLike,
    handleFollow,
    deletePost,
    getLink,
  };
}
