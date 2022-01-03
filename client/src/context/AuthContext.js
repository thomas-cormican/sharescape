import React, { createContext, useReducer } from "react";
import axios from "axios";

import AuthReducer from "./AuthReducer";

const INITIAL_STATE = {
  user: null,
  token: null,
  refreshToken: null,
  isFetching: false,
  error: false,
};

export const AuthContext = createContext(INITIAL_STATE);

export function AuthContextProvider({ children }) {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  async function autoLogin() {
    dispatch({ type: "FETCHING" });
    try {
      const response = await axios.post("/api/auth/autoLogin", {
        withCredentials: true,
      });
      console.log(response.data.user);
      dispatch({ type: "LOGIN", payload: { user: response.data.user } });
    } catch (err) {
      dispatch({ type: "ERROR" });
    }
  }

  async function logout() {
    try {
      dispatch({ type: "FETCHING" });
      await axios.post("/api/auth/logout", { withCredentials: true });
      return "success";
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isFetching: state.isFetching,
        error: state.error,
        dispatch,
        autoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
