import { authService } from "fbase";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { collection, where, query, orderBy } from "firebase/firestore";
import { dbService } from "fbase";
import { updateProfile } from "firebase/auth";
const Profile = ({ userObj, refreshUser }) => {
  const history = useHistory();
  const clickLogOut = () => {
    authService.signOut();
    history.push("/");
  };
  const getMyNweets = async () => {
    const q = query(
      collection(dbService, "nweets"),
      where("creatorId", "==", userObj.uid),
      orderBy("createdAt", "desc")
      // where => 필터링
      // orderBy => 정렬
      // noSQL 기반 DB이기 때문에 몇몇 SQL기능은 작동될 수 없다.
    );
    // console.log(q.firestore._firestoreClient.user.uid); // 사용자 id
  };
  useEffect(() => {
    getMyNweets();
  }, []);

  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);

  const changeDisplayName = (e) => {
    const {
      target: { value },
    } = e;

    setNewDisplayName(value);
  };

  const editProfile = async (e) => {
    e.preventDefault();
    if (userObj.displayName !== newDisplayName) {
      // await updateProfile(userObj, {
      //   displayName: newDisplayName,
      // });
      // 버전 업이 되면서 지금은 Auth객체의 CurrentUser속성이 내부적으로는 UserImpl라는 클래스를 상속받아 생성된 것이기에
      // 위 방식대로 객체를 복사하면 UserImpl라는 부모 클래스의 메소드를 복사하지 못해 처음 한번만 update가 되고 두번째 업데이트 부터는 getIdToken 함수를 찾을 수 없다는 에러가 나오게 됩니다.

      // 해결
      await updateProfile(authService.currentUser, {
        displayName: newDisplayName,
      });

      //
      refreshUser();
    }
  };
  return (
    <>
      <form>
        {userObj.photoURL && <img alt="photoURL" src={userObj.photoURL} />}
        <input
          type="text"
          placeholder="Display name"
          onChange={changeDisplayName}
        />
        <input type="submit" value="Update Profile" onClick={editProfile} />
      </form>
      <button onClick={clickLogOut}>Log Out</button>
    </>
  );
};

export default Profile;
