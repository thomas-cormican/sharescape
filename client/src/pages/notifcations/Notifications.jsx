import React, { useContext, useEffect } from "react";
import axios from "axios";

import Notification from "../../components/notification/Notification";
import { AuthContext } from "../../context/AuthContext";

import "./notifications.scss";

function Notifications() {
  const { user, dispatch } = useContext(AuthContext);

  useEffect(() => {
    async function readNotifications() {
      try {
        const res = await axios.put("/api/users/notifications/read", {
          withCredentials: true,
        });
        console.log(res.data);
        dispatch({
          type: "READ NOTIFICATIONS",
          payload: res.data.notifications,
        });
      } catch (err) {
        console.log(err);
      }
    }
    readNotifications();
  }, []);

  return (
    <div className="notifications">
      <div className="layout__heading">
        <h2>Notifications</h2>
        {user && (
          <>
            <div className={`notifications__list`}>
              {user.notifications
                .sort((a, b) => {
                  return new Date(b.createdAt) - new Date(a.createdAt);
                })
                .map((notification) => {
                  return (
                    <Notification
                      key={notification._id}
                      notification={notification}
                    />
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Notifications;
