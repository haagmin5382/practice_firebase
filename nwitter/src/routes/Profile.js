import { authService, storageService } from "fbase";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { collection, where, query, orderBy } from "firebase/firestore";
import { dbService } from "fbase";
import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
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
  };
  useEffect(() => {
    getMyNweets();
  }, []);

  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
  const [newPhotoURL, setNewPhotoURL] = useState(userObj.photoURL);

  const changeDisplayName = (e) => {
    const {
      target: { value },
    } = e;

    setNewDisplayName(value);
  };

  const changeProfilePhoto = (e) => {
    const {
      target: { files },
    } = e;
    const theFile = files[0];

    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setNewPhotoURL(result); // 미리보기 이미지 설정
    }; // 파일 읽기가 끝난 후 finishedEvent를 받는다.
    reader.readAsDataURL(theFile); // readAsDataURL을 사용해서 파일을 읽는다. (파일을 읽기 시작한다)
    e.target.value = "";
  };

  const editProfile = async (e) => {
    e.preventDefault();
    if (userObj.displayName !== newDisplayName && newDisplayName !== "") {
      // await updateProfile(userObj, {
      //   displayName: newDisplayName,
      // });
      // 버전 업이 되면서 지금은 Auth객체의 CurrentUser속성이 내부적으로는 UserImpl라는 클래스를 상속받아 생성된 것이기에
      // 위 방식대로 객체를 복사하면 UserImpl라는 부모 클래스의 메소드를 복사하지 못해 처음 한번만 update가 되고 두번째 업데이트 부터는 getIdToken 함수를 찾을 수 없다는 에러가 나오게 됩니다.
      // 해결
      //
      await updateProfile(authService.currentUser, {
        displayName: newDisplayName,
      });
    }
    let attachmentURL;
    if (userObj.photoURL !== newPhotoURL) {
      const attachmentRef = ref(storageService, `${userObj.uid}`);
      await uploadString(attachmentRef, newPhotoURL, "data_url");

      attachmentURL = await getDownloadURL(ref(storageService, attachmentRef));
      await updateProfile(authService.currentUser, {
        photoURL: attachmentURL || newPhotoURL,
      });
    }
    refreshUser();
  };
  return (
    <div className="container">
      <form className="profileForm">
        <label htmlFor="profilePhoto" className="profileLabel">
          {userObj.photoURL && (
            <img alt="photoURL" src={newPhotoURL} className="profileImg" />
          )}
        </label>
        <input
          type="file"
          accept="image/*"
          id="profilePhoto"
          style={{ display: "none" }}
          onChange={changeProfilePhoto}
        />
        <input
          type="text"
          placeholder="Display name"
          autoFocus
          onChange={changeDisplayName}
          className="formInput"
        />
        <input
          type="submit"
          value="Update Profile"
          onClick={editProfile}
          className="formBtn"
          style={{
            marginTop: 10,
          }}
        />
      </form>
      <span onClick={clickLogOut} className="formBtn cancelBtn logOut">
        Log Out
      </span>
    </div>
  );
};

export default Profile;
