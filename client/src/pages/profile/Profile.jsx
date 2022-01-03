import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import date from "date-and-time";
import { AiOutlineCalendar, AiOutlineMessage } from "react-icons/ai";
import { BiCurrentLocation } from "react-icons/bi";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";

import Feed from "../../components/feed/Feed";
import Modal from "../../components/modal/Modal";
import EditProfileForm from "../../components/editProfileForm/EditProfileForm";
import { AuthContext } from "../../context/AuthContext";
import "./profile.scss";

function Profile() {
  const [profileUser, setProfileUser] = useState(null);
  const { user, dispatch } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState(false);
  const userId = useParams().userId;

  const [fetchFollow, setFetchFollow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const req = await axios.get(`/api/users/${userId}`);
        setProfileUser(req.data.user);
      } catch (err) {
        console.log(err);
      }
    }
    fetchUser();
  }, [userId, user]);

  async function messageUser(e) {
    e.preventDefault();
    try {
      const response = await axios.get(`/api/conversations/user/${user._id}`);
      const foundConversation = response.data.conversations.find(
        (conversation) => {
          if (
            (conversation.user1._id === user._id &&
              conversation.user2._id === profileUser._id) ||
            (conversation.user2._id === user._id &&
              conversation.user1._id === profileUser._id)
          ) {
            return conversation;
          }
        }
      );

      if (!foundConversation) {
        const res = await axios.post(`/api/conversations/`, {
          user2: profileUser._id,
        });
        navigate(`/home/messages/${res.data.conversation._id}`);
      } else {
        navigate(`/home/messages/${foundConversation._id}`);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function followUser() {
    setFetchFollow(true);
    try {
      const res = await axios.post(`/api/users/${profileUser._id}/follow`);
      if (res.data === "User Followed") {
        await axios.post(`/api/users/notifications/${profileUser._id}`, {
          type: "followed you",
        });
        dispatch({ type: "FOLLOW USER", payload: profileUser._id });
        setProfileUser((prev) => {
          return { ...prev, followers: [...prev.followers, user] };
        });
      } else {
        dispatch({ type: "UNFOLLOW USER", payload: profileUser._id });
        setProfileUser((prev) => {
          return {
            ...prev,
            followers: prev.followers.filter(
              (follower) => follower._id !== user._id
            ),
          };
        });
      }
    } catch (err) {
      console.log(err);
    }

    setFetchFollow(false);
  }
  if (profileUser) {
    return (
      <>
        <div className="profile">
          <div className="layout__heading">
            <h2>{profileUser?.username}</h2>
            <p>{profileUser?.posts.length} Posts</p>
          </div>
          <div className="profile__top">
            <div className="profile__cover-image">
              <img
                src={
                  profileUser?.profileCoverPic
                    ? `/images/profile/${profileUser?.profileCoverPic}`
                    : "/defaultCoverPicture.png"
                }
                alt=""
              />
            </div>
            <div className="profile__user-info">
              <div className="profile__user-info__top">
                <img
                  src={
                    profileUser?.profilePic
                      ? `/images/profile/${profileUser?.profilePic}`
                      : "/defaultProfilePicture.jpg"
                  }
                  alt=""
                />

                {user?._id === profileUser?._id ? (
                  <button
                    onClick={() => {
                      setOpenModal(true);
                    }}
                  >
                    Edit profile
                  </button>
                ) : (
                  <div className="profile__user-info__buttons">
                    <button onClick={messageUser}>
                      <AiOutlineMessage />
                    </button>
                    <button disabled={fetchFollow} onClick={() => followUser()}>
                      {user.following.includes(profileUser._id)
                        ? "Unfollow"
                        : "Follow"}
                    </button>
                  </div>
                )}
              </div>
              <h3 className="profile__user-info__name">
                @{profileUser?.username}
              </h3>
              <p className="profile__user-info__bio">{profileUser.bio}</p>
              {profileUser?.location && (
                <p className="profile__user-info__location">
                  <BiCurrentLocation /> {profileUser?.location}
                </p>
              )}
              <p className="profile__user-info__joined">
                <AiOutlineCalendar /> Joined{" "}
                {date.format(new Date(profileUser?.createdAt), "MMMM YYYY")}
              </p>
              <div>
                <span className="profile__user-info__following profile__user-info__following-1">
                  <span className="">{profileUser?.following.length}</span>{" "}
                  Following
                </span>
                <span className="profile__user-info__following profile__user-info__following-2">
                  <span>{profileUser?.followers.length}</span> Followers
                </span>
              </div>
            </div>
          </div>
          <div className="profile__feed">
            {profileUser && <Feed key="2" userId={userId} />}
          </div>
        </div>
        {openModal && (
          <Modal
            closeModal={() => {
              setOpenModal(false);
            }}
          >
            <EditProfileForm
              user={profileUser}
              onSubmit={() => setOpenModal(false)}
            />
          </Modal>
        )}
      </>
    );
  } else {
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <CircularProgress />
      </div>
    );
  }
}

export default Profile;
