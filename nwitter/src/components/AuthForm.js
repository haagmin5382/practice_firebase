import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";

const AuthForm = () => {
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

  return (
    <>
      <form onSubmit={onSubmit} className="container">
        <input
          name="email"
          type="text"
          placeholder="Email"
          required
          value={email}
          onChange={inputChange}
          className="authInput"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={inputChange}
          className="authInput"
        />
        <input type="submit" value={newAccount ? "Create Account" : "LogIn"} />
        {errorMessage && <span className="authError">{errorMessage}</span>}
      </form>
      <span onClick={toggleAccount} className="authSwitch">
        {newAccount ? "Login" : "Create Account"}
      </span>
    </>
  );
};

export default AuthForm;
