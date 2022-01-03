import { useState, useContext } from "react";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";

export default function useLocalSignUp() {
  const [user, setUser] = useState({ email: "", password: "", error: null });
  const { dispatch } = useContext(AuthContext);

  async function login() {
    try {
      const res = await axios.post("/api/auth/login", user);
      dispatch({ type: "LOGIN", payload: { user: res.data.user } });
    } catch (err) {
      setUser((prev) => {
        return { ...prev, error: "Incorrect credentials" };
      });
    }
  }

  return { user, setUser, login };
}
