import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { BiMenu } from "react-icons/bi";

import "./layout.scss";
import Header from "../../components/header/Header";
import Modal from "../../components/modal/Modal";
import PostForm from "../../components/postForm/PostForm";
import Searchbar from "../../components/searchbar/Searchbar";
import Newsbar from "../../components/newsbar/Newsbar";

function Layout() {
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <div className="main">
        <div className="layout__header" style={showMenu ? { left: "0px" } : {}}>
          <Header
            toggleMenu={setShowMenu}
            openModal={() => setShowModal(true)}
          />
        </div>
        <div className="layout">
          <div className="layout__middle">
            <Outlet />
          </div>
          <div className="layout__right">
            <div className="layout__right__content">
              <Searchbar />
              <Newsbar />
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <Modal
          closeModal={() => {
            setShowModal(false);
          }}
        >
          <PostForm
            closeModal={() => {
              setShowModal(false);
            }}
            id="1"
            key="1"
            inModal
          />
        </Modal>
      )}
      <div
        onClick={() => {
          setShowMenu(!showMenu);
        }}
        className="layout__header__button"
      >
        <BiMenu />
      </div>
      {showMenu && (
        <div
          onClick={() => {
            setShowMenu(false);
          }}
          className="layout__header__overlay"
        ></div>
      )}
    </>
  );
}

export default Layout;
