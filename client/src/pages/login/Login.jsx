import React, { useState, useContext } from "react";
import { GoogleLogin } from "react-google-login";
import axios from "axios";
import { IoIosPaperPlane } from "react-icons/io";

import "./login.scss";
import Button from "../../components/button/Button";
import Modal from "../../components/modal/Modal";
import useLocalSignUp from "../../hooks/useLocalSignUp";
import useLocalLogin from "../../hooks/useLocalLogin";
import { AuthContext } from "../../context/AuthContext";

function Login() {
  const [showModal, setShowModal] = useState(false);
  const [emailSignUp, setEmailSignUp] = useState(false);
  const { signUpUser, dispatch: signUpDispatch, signUp } = useLocalSignUp();
  const { user, setUser, login } = useLocalLogin();
  const { dispatch } = useContext(AuthContext);

  async function responseGoogleSuccess(res) {
    dispatch({ type: "FETCHING" });
    try {
      const response = await axios.post(
        "/api/auth/google-login",
        {
          tokenId: res.tokenId,
        },
        { withCredentials: true }
      );
      console.log(response);
      dispatch({ type: "LOGIN", payload: response.data });
    } catch (err) {
      console.log("error" + err);
      dispatch({ type: "ERROR" });
    }
  }

  function responseGoogleFailure(response) {
    console.log(response);
  }

  return (
    <div className="login">
      <div className="login__row">
        <div className="login__col-1">
          <div className="login__logo">
            <IoIosPaperPlane />
          </div>
        </div>
        <div className="login__col-2">
          <div className="login__box">
            <h1>Happening now</h1>
            <h2>Join Sharescape today</h2>
            <div class="login__buttons">
              <GoogleLogin
                clientId="637549131686-5f6ggvr7e0453jg09r3adj9mlmsdlneh.apps.googleusercontent.com"
                buttonText="Sign up with Google"
                onSuccess={responseGoogleSuccess}
                onFailure={responseGoogleFailure}
                cookiePolicy={"single_host_origin"}
                render={(renderProps) => (
                  <Button onClick={renderProps.onClick} logo="google">
                    Sign up with Google
                  </Button>
                )}
              />
              <div className="login__or">
                <div className="divider" />
                <span>or</span>
                <div className="divider" />
              </div>
              {!emailSignUp ? (
                <Button onClick={() => setEmailSignUp(true)}>
                  Sign up with Email
                </Button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    signUp();
                  }}
                  className="login__sign-up__form"
                >
                  <input
                    name="email"
                    className="login__sign-up__input"
                    type="email"
                    placeholder="Email"
                    value={signUpUser.email}
                    required
                    onChange={(e) => {
                      signUpDispatch({
                        type: "email",
                        payload: e.target.value,
                      });
                    }}
                  />
                  <input
                    minLength="4"
                    maxLength="16"
                    name="username"
                    className="login__sign-up__input"
                    type="text"
                    placeholder="Username"
                    value={signUpUser.username}
                    required
                    onChange={(e) => {
                      signUpDispatch({
                        type: "username",
                        payload: e.target.value,
                      });
                    }}
                  />
                  <input
                    name="password"
                    className="login__sign-up__input"
                    minLength="8"
                    type="password"
                    placeholder="Password"
                    value={signUpUser.password}
                    required
                    onChange={(e) => {
                      signUpDispatch({
                        type: "password",
                        payload: e.target.value,
                      });
                    }}
                  />
                  <input
                    name="confirmPassowrd"
                    className="login__sign-up__input"
                    minLength="8"
                    type="password"
                    placeholder="Confirm Password"
                    value={signUpUser.confirmPassword}
                    required
                    onChange={(e) => {
                      signUpDispatch({
                        type: "confirmPassword",
                        payload: e.target.value,
                      });
                    }}
                  />
                  {signUpUser.error && (
                    <p className="login__sign-up__error">{signUpUser.error}</p>
                  )}
                  <Button primary>Sign up</Button>
                </form>
              )}

              <p className="login__privacy">
                By signing up, you agree to the Terms of Service and Privacy
                Policy, including Cookie Use.
              </p>
              <h3>Already have an account?</h3>
              <Button onClick={() => setShowModal(!showModal)} primary>
                Sign in
              </Button>
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
          <div className="login__box login__box-2">
            <h2>Sign in to Sharescape</h2>
            <div class="login__buttons">
              <GoogleLogin
                clientId="637549131686-5f6ggvr7e0453jg09r3adj9mlmsdlneh.apps.googleusercontent.com"
                buttonText="Sign up with Google"
                onSuccess={responseGoogleSuccess}
                onFailure={responseGoogleFailure}
                cookiePolicy={"single_host_origin"}
                render={(renderProps) => (
                  <Button onClick={renderProps.onClick} logo="google">
                    Sign in with Google
                  </Button>
                )}
              />
              <div className="login__or">
                <div className="divider" />
                <span>or</span>
                <div className="divider" />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  login();
                }}
                className="login__sign-up__form"
              >
                <input
                  name="email"
                  className="login__sign-up__input"
                  type="email"
                  placeholder="Email"
                  value={user.email}
                  required
                  onChange={(e) => {
                    setUser((prev) => {
                      return { ...prev, email: e.target.value };
                    });
                  }}
                />
                <input
                  name="password"
                  className="login__sign-up__input"
                  type="password"
                  placeholder="Password"
                  value={user.password}
                  required
                  onChange={(e) => {
                    setUser((prev) => {
                      return { ...prev, password: e.target.value };
                    });
                  }}
                />
                {user.error && (
                  <p className="login__sign-up__error">{user.error}</p>
                )}
                <Button primary>Sign in</Button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Login;
