import { useEffect, useState } from "react";
import AppRouter from "components/Router";
import { authService } from "fbase";

function App() {
  const [init, setInit] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userObj, setUserObj] = useState(null);

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        // setUserObj(user); // user 객체 내부 key들을 일부만 사용하기 때문에 리소스 낭비가 되므로 사용할 것만 가져온다.
        // 이렇게
        setUserObj({
          email: user.email,
          photoURL: user.photoURL,
          displayName: user.displayName || user.email.split("@")[0],
          uid: user.uid,
          updateProfile: (args) => user.updateProfile(args),
        });
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
  // console.log(init); // authService.onAuthStateChanged 때문에 init의 상태 값이 true로 바뀌면서 <AppRouter> 컴포넌트가 나오게 된다.

  const refreshUser = () => {
    // 이렇게 해주는 이유는 Profile 컴포넌트에서 updateProfile을 사용하게 되면, firebase 쪽에 있는 user를 새로고침 해주게 되는데
    // 우리의 header , Navigation은 firebase에 연결되어있지 않기 때문에, firebase 정보를 가지고 react.js의 정보를 업데이트 해주어야한다.
    // 그 역할을 이 함수가 하게 된다.

    // setUserObj(authService.currentUser); // 상태 변화를 주었는데 다시 렌더링 되지 않는 이유는?
    // console.log(authService.currentUser);
    // authService.currentUser 가 굉장히 큰 객체인 것을 알 수 있다.
    // 이럴 경우 react에 결정장애가 올 수 있는데, 현재의 상태가 과거의 상태와 다른지 판단하는데 react가 어려움을 겪는다.
    // 해결책 2가지
    // 1. object의 크기를 줄인다.
    const user = authService.currentUser;

    setUserObj({
      email: user.email,
      photoURL: user.photoURL,
      displayName: user.displayName || user.email.split("@")[0],
      uid: user.uid,
      updateProfile: (args) => user.updateProfile(args),
    });
    // 버전 업이 되면서 지금은 Auth객체의 CurrentUser속성이 내부적으로는 UserImpl라는 클래스를 상속받아 생성된 것이기에
    // 위 방식대로 객체를 복사하면 UserImpl라는 부모 클래스의 메소드를 복사하지 못해 처음 한번만 update가 되고 두번째 업데이트 부터는 getIdToken 함수를 찾을 수 없다는 에러가 나오게 됩니다.
    // 원인은 아마 객체를 복사할 때 Auth 객체의 Currentuser 객체 속의 private 속성은 복사가 안되고
    // 일반 Object 클래스를 상속받아 복사가 이루어 지면서 getIdToken 함수를 찾을 수 없게 되는 걸로 추측하고 있습니다.
    // 지금 이 글을 쓰고 있는 시점의 파이어베이스 v9의 Auth 패키지의 함수 중에 updateCurrentUser라는 함수가 있는데
    // refreshUser 함수에 updateCurrentUser 함수를 먼저 호출하고 setUserObj(Authservice.currentUser)를 호출하면 정상 동작합니다.

    // 2. 기존 방식에서 Object.assign({},user)
  };
  return (
    <>
      {init ? (
        <AppRouter
          isLoggedIn={isLoggedIn}
          userObj={userObj}
          refreshUser={refreshUser}
        />
      ) : (
        "Initializing ..."
      )}
      <footer>&copy; {new Date().getFullYear()} Nwitter</footer>
    </>
  );
}

export default App;
