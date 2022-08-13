import { useEffect, useState } from "react";
import AppRouter from "components/Router";
import { authService } from "fbase";

function App() {
  const [init, setInit] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        setInit(true);
      } else {
        setIsLoggedIn(false);
      }
      setInit(true);
    }); // 사용자 로그인 상태의 변화를 관찰한다.
  }, []);
  // console.log(authService.currentUser);
  // setInterval(() => {
  //   // console.log(authService.currentUser); // 인증하는데 시간이 걸린다.
  // }, 2000);
  console.log(init); // authService.onAuthStateChanged 때문에 init의 상태 값이 true로 바뀌면서 <AppRouter> 컴포넌트가 나오게 된다.
  return (
    <>
      {init ? <AppRouter isLoggedIn={isLoggedIn} /> : "Initializing ..."}
      <footer>&copy; {new Date().getFullYear()} Nwitter</footer>
    </>
  );
}

export default App;
