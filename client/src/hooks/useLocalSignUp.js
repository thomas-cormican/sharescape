import { useReducer, useContext } from "react";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";

function signUpReducer(state, action) {
  switch (action.type) {
    case "email":
      return {
        ...state,
        email: action.payload,
      };

    case "username":
      return {
        ...state,
        username: action.payload,
      };

    case "password":
      return {
        ...state,
        password: action.payload,
      };

    case "confirmPassword":
      return {
        ...state,
        confirmPassword: action.payload,
      };

    case "error":
      return {
        ...state,
        error: action.payload,
      };

    default:
      break;
  }
}

export default function useLocalSignUp() {
  const [user, dispatch] = useReducer(signUpReducer, {
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    error: null,
  });
  const { dispatch: authDispatch } = useContext(AuthContext);

  async function signUp() {
    try {
      if (user.password !== user.confirmPassword) {
        dispatch({ type: "error", payload: "Passwords must match" });
        return;
      }
      const res = await axios.post("/api/auth", {
        email: user.email,
        username: user.username,
        password: user.password,
      });
      authDispatch({ type: "LOGIN", payload: { user: res.data.user } });
    } catch (err) {
      const errors = err.response.data.error.errors;
      if (errors.emailLower) {
        errors.emailLower.kind === "unique" &&
          dispatch({ type: "error", payload: "Email is already in use" });
      } else if (errors.usernameLower) {
        errors.usernameLower.kind === "unique" &&
          dispatch({ type: "error", payload: "Username is already in use" });
      }
    }
  }

  return { signUpUser: user, dispatch, signUp };
}
