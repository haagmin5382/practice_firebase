import { dbService, storageService } from "fbase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import React, { useState } from "react";

const Nweet = ({ nweetObj, isOwner }) => {
  const [editing, setEditing] = useState(false); // edit모드로 바꿀지 여부
  const [newNweet, setNewNweet] = useState(nweetObj.text); // 업데이트할 내용

  const selectedNweet = doc(dbService, "nweets", `${nweetObj.id}`); // firestore
  const deserRef = ref(storageService, nweetObj.attachmentURL); // storage
  const onDeleteClick = async () => {
    const ok = window.confirm("Are you sure you want to delete this nweet?");
    // 확인을 누르면 true를, 취소를 누르면 false를 반환한다.
    if (ok) {
      // delete nweet
      await deleteDoc(selectedNweet); // 선택된 Nweet(selectedNweet)을 삭제
      if (nweetObj.attachmentURL !== "") {
        await deleteObject(deserRef); // 삭제하려는 트윗에 이미지 파일이 있는 경우 이미지 파일을 스토리지에서 삭제
      }
    }
  };

  const toggleEditing = () => {
    setEditing((prev) => !prev);
  };

  const editNweet = (e) => {
    const {
      target: { value },
    } = e;
    setNewNweet(value);
  };

  const submitEditedNweet = async (e) => {
    e.preventDefault();
    await updateDoc(selectedNweet, { text: newNweet }); // 선택된 트윗(selectedNweet)에, 업데이트 할 내용(text: newNweet)
    // console.log(nweetObj, newNweet);
    setEditing(false); // edit모드 해제
  };
  return (
    <div>
      {editing ? (
        <>
          <form>
            <input
              type="text"
              placeholder="Edit your Nweet"
              value={newNweet}
              required
              onChange={editNweet}
            />
            <input
              onClick={submitEditedNweet}
              type="submit"
              value="Update Nweet"
            />
          </form>
          <button onClick={toggleEditing}>Cancel</button>
        </>
      ) : (
        <>
          <h4>{nweetObj.text}</h4>
          {nweetObj.attachmentURL && (
            <img alt="attachmentURL" src={nweetObj.attachmentURL} />
          )}
          {isOwner && (
            <>
              <button onClick={onDeleteClick}>Delete Nweet</button>
              <button onClick={toggleEditing}>Edit Nweet</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Nweet;
