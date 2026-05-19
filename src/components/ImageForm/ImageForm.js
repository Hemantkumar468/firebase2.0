import React, { useState, useEffect } from "react";
import "./ImageForm.css";

function ImageForm({ onSubmit, onCancel, editImage }) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Prefill the form if editImage is provided
  useEffect(() => {
    if (editImage) {
      setTitle(editImage.title || "");
      setImageUrl(editImage.url || "");
    } else {
      setTitle("");
      setImageUrl("");
    }
  }, [editImage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;
    onSubmit({
      title: title.trim(),
      url: imageUrl.trim(),
    });
    // Clear the form if not editing
    if (!editImage) {
      handleClear();
    }
  };

  const handleClear = () => {
    setTitle("");
    setImageUrl("");
  };

  return (
    <div className="image-form-container">
      <h2>{editImage ? "Update image" : "Add image"}</h2>
      <form onSubmit={handleSubmit} className="image-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="image-input"
        />
        <input
          type="url"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
          className="image-input"
        />
        <div className="image-form-buttons">
          <button type="button" onClick={handleClear} className="btn-clear">
            Clear
          </button>
          <button type="submit" className="btn-submit">
            {editImage ? "Update" : "Add"}
          </button>
          {editImage && (
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ImageForm;
