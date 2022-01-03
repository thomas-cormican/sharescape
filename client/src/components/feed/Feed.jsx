import React, { useState, useEffect, useContext } from "react";
import "./feed.scss";
import PostForm from "../postForm/PostForm";
import Post from "../post/Post";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { useLocation } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

function Feed({ heading, userId }) {
  const [posts, setPosts] = useState([]);
  const [loadedPosts, setLoadedPosts] = useState([]);
  const location = useLocation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setLoadedPosts([]);
    async function getPosts() {
      if (location.pathname === "/home/explore") {
        const res = await axios.get(`/api/posts/`);
        setPosts(res.data.posts);
      } else {
        if (userId) {
          const res = await axios.get(`/api/posts/user/${userId}`);
          setPosts(res.data.userPosts);
        } else {
          const res = await axios.get("/api/posts/timeline");
          setPosts(res.data.timelinePosts);
        }
      }
    }
    getPosts();
  }, [user?.username, userId, location.pathname]);

  function addPost(newPost) {
    setPosts([newPost, ...posts]);
  }

  function removePost(id) {
    setPosts((prev) => prev.filter((post) => post._id !== id));
  }

  return (
    <div className="feed">
      {heading && (
        <div className="feed__heading">
          <h2>{heading}</h2>
        </div>
      )}
      {location.pathname === "/home" && user && (
        <div className="feed__form">
          <PostForm
            key="2"
            onLoad={setLoadedPosts}
            onCreatePost={addPost}
            id="2"
            feed
          />
        </div>
      )}

      <div className="feed__posts__wrapper">
        {loadedPosts.length !== posts.length && (
          <div
            style={{
              position: "absolute",

              left: "50%",
              transform: "translate(-50%, 100px)",
            }}
          >
            <CircularProgress />
          </div>
        )}
        <div
          className={`feed__posts ${
            loadedPosts.length !== posts.length && "hide"
          }`}
        >
          {posts.map((post) => {
            return (
              <div className="feed__post" key={post._id}>
                <Post
                  onLoad={setLoadedPosts}
                  key={post._id}
                  onDeletePost={removePost}
                  post={post}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Feed;
