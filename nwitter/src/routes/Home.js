// import { dbService } from "fbase";
import Nweet from "components/Nweet";
import { dbService } from "fbase";
import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import NweetFactory from "components/NweetFactory";

const Home = ({ userObj }) => {
  const [nweets, setNweets] = useState([]);

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

  return (
    <div>
      <NweetFactory userObj={userObj} />
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
