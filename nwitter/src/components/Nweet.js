import { dbService, storageService } from "fbase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPencilAlt } from "@fortawesome/free-solid-svg-icons";

const Nweet = ({ nweetObj, isOwner }) => {
  const [editing, setEditing] = useState(false); // edit모드로 바꿀지 여부
  const [newNweet, setNewNweet] = useState(nweetObj.text); // 업데이트할 내용
  const [newNweetPhoto, setNewNweetPhoto] = useState(nweetObj.attachmentURL);

  const selectedNweet = doc(dbService, "nweets", `${nweetObj.id}`); // firestore
  const deserRef = ref(storageService, nweetObj.attachmentURL); // storage
  const onDeleteClick = async () => {
    const ok = window.confirm("Are you sure you want to delete this nweet?");
    // 확인을 누르면 true를, 취소를 누르면 false를 반환한다.
    if (ok) {
      // delete nweet
      await deleteDoc(selectedNweet); // 선택된 Nweet(selectedNweet)을 삭제
      if (nweetObj.attachmentURL !== null) {
        await deleteObject(deserRef); // 삭제하려는 트윗에 이미지 파일이 있는 경우 이미지 파일을 스토리지에서 삭제
      }
    }
  };

  const toggleEditing = () => {
    setEditing((prev) => !prev);
    setNewNweet(nweetObj.text);
    setNewNweetPhoto(nweetObj.attachmentURL);
  };

  const editNweet = (e) => {
    const {
      target: { value },
    } = e;
    setNewNweet(value);
  };

  const editPhoto = (e) => {
    const {
      target: { files },
    } = e;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setNewNweetPhoto(result); // 미리보기 이미지 설정
    }; // 파일 읽기가 끝난 후 finishedEvent를 받는다.
    reader.readAsDataURL(theFile); // readAsDataURL을 사용해서 파일을 읽는다. (파일을 읽기 시작한다)
    e.target.value = "";
  };

  const clearPhoto = () => {
    setNewNweetPhoto("");
  };

  const submitEditedNweet = async (e) => {
    e.preventDefault();
    await updateDoc(selectedNweet, {
      text: newNweet,
      attachmentURL: newNweetPhoto,
    });

    // 선택된 트윗(selectedNweet)에, 업데이트 할 내용(text: newNweet)
    // console.log(nweetObj, newNweet);
    setEditing(false); // edit모드 해제
  };

  return (
    <div className="nweet">
      {editing ? (
        <>
          <form className=" editContainer nweetEdit">
            <img
              alt="newNweetPhoto"
              src={newNweetPhoto}
              width="200"
              height="200"
            />
            <input
              id="update-photo"
              type="file"
              accept="image/*"
              onChange={editPhoto}
              style={{ display: "none" }}
            />
            <input
              type="text"
              placeholder="Edit your Nweet"
              value={newNweet}
              required
              onChange={editNweet}
            />

            <div>
              <input
                onClick={submitEditedNweet}
                type="submit"
                value="Update Nweet"
                className="formBtn"
              />
              {nweetObj.attachmentURL && (
                <label htmlFor="update-photo">
                  <div className="formBtn">change Photo</div>
                </label>
              )}
              <div
                onClick={clearPhoto}
                className="formBtn"
                style={{
                  marginBottom: "10px",
                  backgroundColor: "#FFC6B4",
                }}
              >
                Clear photo
              </div>
              <div onClick={toggleEditing} className="formBtn cancelBtn">
                Cancel
              </div>
            </div>
          </form>
        </>
      ) : (
        <div className="GridContainer">
          {nweetObj.attachmentURL && (
            <img
              alt="attachmentURL"
              src={nweetObj.attachmentURL}
              width="200px"
              height="200px"
            />
          )}
          <h4>{nweetObj.text}</h4>
          {isOwner && (
            <div className="nweet__actions">
              <span onClick={onDeleteClick}>
                <FontAwesomeIcon icon={faTrash} />
              </span>
              <span onClick={toggleEditing}>
                <FontAwesomeIcon icon={faPencilAlt} />
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Nweet;
