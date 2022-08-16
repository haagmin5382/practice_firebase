import React, { useState } from "react";
import { dbService, storageService } from "fbase";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

const NweetFactory = ({ userObj }) => {
  const [nweet, setNweet] = useState("");
  const [attachment, setAttachment] = useState("");
  const onSubmit = async (e) => {
    e.preventDefault();

    let attachmentURL;

    if (attachment) {
      // 사진을 게시한 글을 업로드 할 경우를 대비
      const attachmentRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
      await uploadString(attachmentRef, attachment, "data_url"); // format : data_url
      // 게시한 이미지를 storage에 저장한다.
      attachmentURL = await getDownloadURL(ref(storageService, attachmentRef));
    }

    const nweetContent = {
      text: nweet,
      createdAt: Date.now(),
      creatorId: userObj.uid, // 로그인할 때  유저정보를 받아온다.
      attachmentURL: attachmentURL || null, // nweet 정보에 attachmentURL을 추가한다. attachmentURL가 없다면 null값을 넣어준다.
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
    e.target.value = "";
  };

  const onClearAttachment = () => {
    setAttachment(""); // 업로드한 사진 삭제
  };

  return (
    <>
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
    </>
  );
};

export default NweetFactory;
