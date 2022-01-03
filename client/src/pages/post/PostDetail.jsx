import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Post from "../../components/post/Post";
import PostForm from "../../components/postForm/PostForm";
import "./postDetail.scss";

function PostDetail() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadedPostDetails, setLoadedPostDetails] = useState(false);
  const [loadedComments, setLoadedComments] = useState([]);
  const postId = useParams().postId;

  useEffect(() => {
    setLoadedComments([]);
    async function getPost() {
      try {
        const res = await axios.get(`/api/posts/${postId}`);
        setPost(res.data.post);
      } catch (err) {
        console.log(err);
      }
    }
    getPost();
  }, [postId]);

  useEffect(() => {
    async function getComments() {
      try {
        const res = await axios.get(`/api/posts/${postId}/comments`);
        setComments(res.data.comments);
      } catch (err) {
        console.log(err);
      }
    }
    getComments();
  }, [postId]);

  function addPost(newComment) {
    setComments([newComment, ...comments]);
  }

  function removePost(id) {
    setComments((prev) => prev.filter((comment) => comment._id !== id));
    setLoadedComments((prev) => prev.filter((comment) => comment._id !== id));
  }

  return (
    <>
      <div className="layout__heading">
        <h2>Post</h2>
      </div>
      <div className={`postdetail ${!loadedPostDetails && "hide"}`}>
        {post && (
          <>
            <Post
              onLoadSingle={setLoadedPostDetails}
              key={post._id}
              post={post}
              postDetailMain={true}
            />

            <hr />
            <PostForm
              onCreatePost={addPost}
              feed
              replyId={post._id}
              authorId={post.authorId}
              placeholder={"Post your comment"}
            />
          </>
        )}
        <hr />
        <div
          className={`postdetail__comments ${
            loadedComments.length !== comments.length && "hide"
          }`}
        >
          {comments.length > 0 &&
            comments.map((comment) => {
              return (
                <div className="postdetail__comment" key={comment._id}>
                  <Post
                    onLoad={setLoadedComments}
                    onDeletePost={removePost}
                    key={comment._id}
                    post={comment}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}

export default PostDetail;
