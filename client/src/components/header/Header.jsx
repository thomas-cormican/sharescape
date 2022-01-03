import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoIosPaperPlane } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import {
  AiOutlineHome,
  AiOutlineCompass,
  AiOutlineBell,
  AiOutlineMail,
  AiOutlineUser,
} from "react-icons/ai";
import Button from "../button/Button";
import { AuthContext } from "../../context/AuthContext";

import "./header.scss";

function Header({ openModal, toggleMenu }) {
  const { user, logout, dispatch } = useContext(AuthContext);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="header">
        <nav
          onClick={() => {
            toggleMenu(false);
          }}
          className="header__nav"
        >
          <ul className="header__links">
            <li className="header__link header__link__logo">
              <NavLink to="/home">
                <IoIosPaperPlane />
              </NavLink>
            </li>
            <li className="header__link">
              <NavLink
                end
                to="/home"
                style={({ isActive }) =>
                  isActive ? { fontWeight: 700 } : undefined
                }
              >
                <AiOutlineHome />
                <span className="header__link__text">Home</span>
              </NavLink>
            </li>
            <li className="header__link">
              <NavLink
                to="/home/explore"
                style={({ isActive }) =>
                  isActive ? { fontWeight: 700 } : undefined
                }
              >
                <AiOutlineCompass />
                <span className="header__link__text">Explore</span>
              </NavLink>
            </li>
            {user && (
              <>
                <li className="header__link">
                  <NavLink
                    to="/home/notifications"
                    style={({ isActive }) =>
                      isActive ? { fontWeight: 700 } : undefined
                    }
                  >
                    <AiOutlineBell />
                    <span className="header__link__text">Notifications </span>

                    {user.notifications &&
                      user.notifications.length > 0 &&
                      user.notifications.filter((notification) => {
                        return notification.read === false;
                      }).length > 0 && (
                        <span className="header__link__alert">
                          {
                            user.notifications.filter((notification) => {
                              return notification.read === false;
                            }).length
                          }
                        </span>
                      )}
                  </NavLink>
                </li>
                <li className="header__link">
                  <NavLink
                    to="/home/messages"
                    style={({ isActive }) =>
                      isActive ? { fontWeight: 700 } : undefined
                    }
                  >
                    <AiOutlineMail />
                    <span className="header__link__text">Messages</span>
                  </NavLink>
                </li>

                <li className="header__link">
                  <NavLink
                    to={`/home/profile/${user._id}`}
                    style={({ isActive }) =>
                      isActive ? { fontWeight: 700 } : undefined
                    }
                  >
                    <AiOutlineUser />
                    <span className="header__link__text">Profile</span>
                  </NavLink>
                </li>
              </>
            )}
          </ul>
          {user && (
            <Button
              onClick={() => {
                openModal();
              }}
              primary
              post
              size="small"
            >
              Share
            </Button>
          )}
        </nav>
        {user && (
          <div className="header__account">
            <div
              className="header__account__button"
              onClick={() => setShowLogout(!showLogout)}
            >
              <div className="header__account__pic">
                <img
                  src={
                    user?.profilePic
                      ? `/images/profile/${user.profilePic}`
                      : "/defaultProfilePicture.jpg"
                  }
                  alt=""
                />
              </div>
              <p className="header__account__name">@{user?.username}</p>
              <div className="header__account__settings">
                <BsThreeDots />
              </div>
            </div>
            {showLogout && (
              <>
                <div
                  className="header__account__overlay"
                  onClick={() => {
                    setShowLogout(false);
                  }}
                ></div>
                <div
                  className="header__account__logout"
                  onClick={async () => {
                    await logout();
                    navigate("/");
                    dispatch({ type: "LOGOUT" });
                  }}
                >
                  <p>Logout @{user?.username}</p>
                </div>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}

export default Header;
