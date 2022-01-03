import { useEffect } from "react";
import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

import "./App.scss";
import Login from "./pages/login/Login";
import Layout from "./pages/layout/Layout";
import Feed from "./components/feed/Feed";
import PostDetail from "./pages/post/PostDetail";
import Profile from "./pages/profile/Profile";
import Explore from "./pages/explore/Explore";
import Notifications from "./pages/notifcations/Notifications";
import Messages from "./pages/messages/Messages";
import MessageDetail from "./pages/messages/MessageDetail";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { user, autoLogin, isFetching } = useContext(AuthContext);

  useEffect(() => {
    autoLogin();
  }, []);

  return (
    <>
      {isFetching ? (
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
      ) : (
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={user ? <Navigate to="/home" /> : <Login />}
              />
              <Route path="/home" element={<Layout />}>
                <Route exact index element={<Feed key="1" heading="Home" />} />
                <Route path="post/:postId" element={<PostDetail />} />
                <Route path="profile/:userId" element={<Profile />} />
                <Route path="explore" element={<Explore />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="messages" element={<Messages />} />
                <Route
                  path="messages/:conversationId"
                  element={<MessageDetail />}
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      )}
    </>
  );
}

export default App;
