import React, { useState } from "react";
import "./AlbumForm.css";

function AlbumForm({ onCreateAlbum, onCancel }) {
  const [albumName, setAlbumName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!albumName.trim()) return;
    onCreateAlbum(albumName.trim());
    setAlbumName("");
  };

  const handleClear = () => {
    setAlbumName("");
  };

  return (
    <div className="album-form-container">
      <h2>Create an album</h2>
      <form onSubmit={handleSubmit} className="album-form">
        <input
          type="text"
          placeholder="Album Name"
          value={albumName}
          onChange={(e) => setAlbumName(e.target.value)}
          required
          className="album-input"
        />
        <div className="album-form-buttons">
          <button type="button" onClick={handleClear} className="btn-clear">
            Clear
          </button>
          <button type="submit" className="btn-create">
            Create an album
          </button>
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AlbumForm;
