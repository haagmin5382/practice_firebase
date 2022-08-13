import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { authService } from "fbase";
const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newAccount, setNewAccount] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const inputChange = (e) => {
    // console.log(e.target.name);
    const {
      target: { name, value },
    } = e;
    if (name === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    let data;
    const auth = getAuth();
    try {
      if (newAccount) {
        // create account
        data = await createUserWithEmailAndPassword(auth, email, password);

        // 사용자 계정을 성공적으로 만들면, 이 사용자는 어플리케이션에 바로 로그인 될 것이다.
      } else {
        // login
        data = await signInWithEmailAndPassword(auth, email, password);
      }
      // console.log(data);
      // persistence 기본값은 local => 아무리 새로고침해도 사용자 정보는 여전히 저장되어 있다.
      // local,session,none
    } catch (error) {
      setErrorMessage(error.message);
    }
  };
  const toggleAccount = () => {
    setNewAccount((prev) => !prev);
  };

  const onSocialClick = async (e) => {
    const {
      target: { name },
    } = e;
    let provider;
    if (name === "google") {
      provider = new GoogleAuthProvider();
    } else {
      provider = new GithubAuthProvider();
    }
    const data = await signInWithPopup(authService, provider);
    console.log(data);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          name="email"
          type="text"
          placeholder="Email"
          required
          value={email}
          onChange={inputChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={inputChange}
        />
        <input type="submit" value={newAccount ? "Create Account" : "LogIn"} />
        {errorMessage}
      </form>
      <span onClick={toggleAccount}>
        {newAccount ? "Login" : "Create Account"}
      </span>
      <div>
        <button onClick={onSocialClick} name="google">
          Continue With Google
        </button>
        <button onClick={onSocialClick} name="github">
          Continue With Github
        </button>
      </div>
    </div>
  );
};

export default Auth;
