// import { dbService } from "fbase";
import Nweet from "components/Nweet";
import { dbService, storageService } from "fbase";
import { v4 as uuidv4 } from "uuid";
import {
  getDocs,
  addDoc,
  collection,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import React, { useEffect, useState } from "react";

const Home = ({ userObj }) => {
  const [nweet, setNweet] = useState("");
  const [nweets, setNweets] = useState([]);
  const [attachment, setAttachment] = useState();
  // const getNweets = async () => {
  //   const dbnweets = await getDocs(collection(dbService, "nweets"));
  //   dbnweets.forEach((document) => {
  //     // console.log(document.data());
  //     const nweetObject = {
  //       ...document.data(),
  //       id: document.id,
  //     };
  //     setNweets((prev) => [nweetObject, ...prev]);
  //   });
  // }; // 예전 방식 (snapshot을 이용한 방식이 좀 더 간편하다 , 또한 더 적게 re-render하기 때문에 더 빠르게 실행되도록 만들어 준다.)
  useEffect(() => {
    // getNweets(); // 예전 방식
    onSnapshot(collection(dbService, "nweets"), (snapShot) => {
      const nweetArray = snapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNweets(nweetArray); // 더 적은 렌더링으로 데이터가 실시간으로 변한다.
    });
    // snapshot은 데이터베이스에 무슨일이 일어날 때, 알림을 받는다.
    // 여기서는 firestore의 nweets 컬렉션에 무슨 일이 발생할 경우 콜백함수를 실행한다.
  }, []);
  // console.log(nweets);
  const onSubmit = async (e) => {
    e.preventDefault();
    let attachmentURL;
    if (attachment !== "") {
      // 사진을 게시하지 않은 글을 업로드 할 경우를 대비
      const attachmentRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
      const response = await uploadString(
        attachmentRef,
        attachment,
        "data_url"
      ); // format : data_url
      // 게시한 이미지를 storage에 저장한다.
      attachmentURL = await getDownloadURL(ref(storageService, attachmentRef));
    }

    const nweetContent = {
      text: nweet,
      createdAt: Date.now(),
      creatorId: userObj.uid, // 로그인할 때  유저정보를 받아온다.
      attachmentURL,
    };
    await addDoc(collection(dbService, "nweets"), nweetContent);
    // console.log(response);
    // await addDoc(collection(dbService, "nweets"), {
    //   text: nweet,
    //   createdAt: Date.now(),
    //   creatorId: userObj.uid, // 로그인할 때  유저정보를 받아온다.
    // });
    setNweet("");
    setAttachment("");
  };
  const onChange = (e) => {
    const {
      target: { value },
    } = e;
    setNweet(value);
  };

  const onFileChange = (e) => {
    // 사진 파일 업로드
    const {
      target: { files },
    } = e;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result); // 미리보기 이미지 설정
    }; // 파일 읽기가 끝난 후 finishedEvent를 받는다.
    reader.readAsDataURL(theFile); // readAsDataURL을 사용해서 파일을 읽는다. (파일을 읽기 시작한다)
    // console.log(theFile);
  };

  const onClearAttachment = () => {
    setAttachment(null); // 업로드한 사진 삭제
  };

  return (
    <div>
      <form>
        <input
          type="text"
          placeholder="What's on your mind"
          maxLength={120}
          value={nweet}
          onChange={onChange}
        />
        <input type="file" accept="image/*" onChange={onFileChange} />
        <input type="submit" value="Nweet" onClick={onSubmit} />
        {attachment && (
          <div>
            <img alt="attachment" src={attachment} width="50px" height="50px" />
            <button onClick={onClearAttachment}>Clear Photo</button>
          </div>
        )}
      </form>
      <div>
        {nweets.map((nweet) => {
          return (
            <Nweet
              key={nweet.id}
              nweetObj={nweet}
              isOwner={nweet.creatorId === userObj.uid}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Home;
