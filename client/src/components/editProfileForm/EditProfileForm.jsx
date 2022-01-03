import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";

import { AuthContext } from "../../context/AuthContext";
import "./editProfileForm.scss";
import "../../pages/profile/profile.scss";

function EditProfileForm({ user, onSubmit }) {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [updatedCoverImage, setUpdatedCoverImage] = useState(null);
  const [updatedProfilePic, setUpdatedProfilePic] = useState(null);
  const { dispatch } = useContext(AuthContext);

  useEffect(() => {
    setUsername(user.username);
    setBio(user.bio);
    setLocation(user.location);
  }, [user]);

  function handleFile(e) {
    const { name, files } = e.target;
    name === "coverPic" && setUpdatedCoverImage(files[0]);
    name === "profilePic" && setUpdatedProfilePic(files[0]);
    e.target.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData();
    data.append("username", username);
    updatedProfilePic && data.append("profilePic", updatedProfilePic);
    updatedCoverImage && data.append("profileCoverPic", updatedCoverImage);
    bio && data.append("bio", bio);
    location && data.append("location", location);
    try {
      const res = await axios.put(`/api/users/${user._id}`, data);
      dispatch({
        type: "UPDATE USER",
        payload: { user: res.data.updatedUser },
      });
      onSubmit();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e);
      }}
      className="edit-profile"
    >
      <div className="profile__cover-image edit-profile__cover-image">
        <label htmlFor="coverPic" className="edit-profile__cover-image__button">
          <FaEdit />
        </label>
        <img
          src={
            updatedCoverImage
              ? URL.createObjectURL(updatedCoverImage)
              : user.profileCoverPic
              ? `/images/profile/${user.profileCoverPic}`
              : "/defaultCoverPicture.png"
          }
          alt=""
        />
      </div>
      <div className="profile__user-info">
        <div className="profile__user-info__top">
          <div className="edit-profile__pic">
            <label htmlFor="profilePic" className="edit-profile__pic__button">
              <FaEdit />
            </label>
            <img
              src={
                updatedProfilePic
                  ? URL.createObjectURL(updatedProfilePic)
                  : user.profilePic
                  ? `/images/profile/${user.profilePic}`
                  : "/defaultProfilePicture.jpg"
              }
              alt=""
            />
          </div>
        </div>
      </div>
      <div className="edit-profile__inputs">
        <input
          onChange={(e) => handleFile(e)}
          type="file"
          name="coverPic"
          accept=".jpg, .jpeg, .png"
          id="coverPic"
        />
        <input
          onChange={(e) => handleFile(e)}
          type="file"
          name="profilePic"
          accept=".jpg, .jpeg, .png"
          id="profilePic"
        />
        <input
          className="edit-profile__input"
          value={username}
          minLength="4"
          maxLength="16"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          type="text"
          placeholder="Username"
        />
        <textarea
          className="edit-profile__textarea"
          value={bio}
          maxLength="160"
          rows="3"
          onChange={(e) => {
            setBio(e.target.value);
          }}
          placeholder="Bio"
        />
        <input
          className="edit-profile__input"
          value={location}
          maxLength="30"
          onChange={(e) => {
            setLocation(e.target.value);
          }}
          placeholder="Location"
        />
        <button class="edit-profile__button">Save</button>
      </div>
    </form>
  );
}

export default EditProfileForm;
