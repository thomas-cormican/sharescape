import React, { useState, useEffect } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import axios from "axios";
import { Link } from "react-router-dom";

import "./searchbar.scss";

function Searchbar({ placeholder, location }) {
  const [fullUsersList, setFullUsersList] = useState([]);
  const [users, setUsers] = useState([]);
  const [input, setInput] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function getUsers() {
      try {
        const res = await axios.get("/api/users/");
        setFullUsersList(res.data.users);
      } catch (err) {
        console.log(err);
      }
    }
    getUsers();
  }, []);

  async function handleChange(e) {
    setUsers(fullUsersList);
    setInput(e.target.value);
    setUsers(
      fullUsersList.filter((user) =>
        user.usernameLower.includes(e.target.value.toLowerCase())
      )
    );
    e.target.value === "" && setUsers([]);
  }

  return (
    <div className="searchbar__wrapper">
      <label htmlFor="searchbar__input" className="searchbar__label">
        <div className="searchbar">
          <span className="searchbar__icon">
            <AiOutlineSearch />
          </span>
          <input
            id="searchbar__input"
            className="searchbar__input"
            type="text"
            placeholder={placeholder ? `${placeholder}` : "Search Sharescape"}
            value={input}
            autocomplete="off"
            onChange={(e) => {
              handleChange(e);
            }}
            onFocus={() => {
              setShowResults(true);
            }}
            onBlur={() => {
              setShowResults(false);
            }}
          />
        </div>
      </label>
      {users.length > 0 && (
        <div
          className={`searchbar__users ${showResults && "show"} ${
            location === "messages" && "searchbar__users__messages"
          }`}
        >
          {users.map((user, index) => {
            return (
              <Link
                to={`/home/profile/${user._id}`}
                style={{ color: "unset", textDecoration: "none" }}
              >
                <div
                  onClick={() => {
                    setShowResults(false);
                  }}
                  className="searchbar__user"
                >
                  <img
                    className="searchbar__user__image"
                    src={
                      user?.profilePic
                        ? `/images/profile/${user.profilePic}`
                        : "/defaultProfilePicture.jpg"
                    }
                    alt=""
                  />
                  <span className="searchbar__user__details">
                    {user.username}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Searchbar;
