import React, { useState } from "react";
import { dbService, storageService } from "fbase";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

const NweetFactory = ({ userObj }) => {
  const [nweet, setNweet] = useState("");
  const [attachment, setAttachment] = useState("");
  const onSubmit = async (e) => {
    e.preventDefault();

    let attachmentURL;

    if (attachment) {
      // 사진을 게시한 글을 업로드 할 경우를 대비
      const attachmentRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
      // 구글 클라우드 스토리지 오브젝트에 대한 참조를 나타낸다 (bucket)
      // 이미지의 path를 넣어준다. (reference에서 폴더를 만들어 넣어주는 역할 firebase console storage 참조)

      await uploadString(attachmentRef, attachment, "data_url");
      // format : data_url
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
      <form onSubmit={onSubmit} className="factoryForm">
        <div className="factoryInput__container">
          <input
            className="factoryInput__input"
            value={nweet}
            onChange={onChange}
            type="text"
            placeholder="What's on your mind?"
            maxLength={120}
          />
          <input type="submit" value="&rarr;" className="factoryInput__arrow" />
        </div>
        <label htmlFor="attach-file" className="factoryInput__label">
          <span>Add photos</span>
          <FontAwesomeIcon icon={faPlus} />
        </label>
        <input
          id="attach-file"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{
            opacity: 0,
          }}
        />
        <input type="submit" value="Nweet" onClick={onSubmit} />
        {attachment && (
          <div className="factoryForm__attachment">
            <img
              alt="attachment"
              src={attachment}
              style={{
                backgroundImage: attachment,
              }}
            />
            <div className="factoryForm__clear" onClick={onClearAttachment}>
              <span>Remove</span>
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </div>
        )}
      </form>
    </>
  );
};

export default NweetFactory;
