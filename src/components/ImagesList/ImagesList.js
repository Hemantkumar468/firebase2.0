import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseInit";
import ImageForm from "../ImageForm/ImageForm";
import Carousel from "../Carousel/Carousel";
import Spinner from "react-spinner-material";
import { toast } from "react-toastify";
import editIcon from "../../images/edit.png";
import deleteIcon from "../../images/trash-bin.png";
import "./ImagesList.css";

function ImagesList({ album, onBack }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(null);

  // Retrieve images of the selected album in real-time
  useEffect(() => {
    setLoading(true);
    const imagesRef = collection(db, "images");
    const q = query(imagesRef, where("albumId", "==", album.id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort locally by createdAt desc to avoid requiring firestore index
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setImages(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching images: ", error);
        toast.error("Failed to load images.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [album.id]);

  // Handle Add or Update Image
  const handleFormSubmit = async (data) => {
    try {
      if (editImage) {
        // Update mode
        const imageRef = doc(db, "images", editImage.id);
        await updateDoc(imageRef, {
          title: data.title,
          url: data.url,
        });
        toast.success("Image updated successfully!");
        setEditImage(null);
        setShowForm(false);
      } else {
        // Add mode
        await addDoc(collection(db, "images"), {
          title: data.title,
          url: data.url,
          albumId: album.id,
          createdAt: Date.now(),
        });
        toast.success("Image added successfully!");
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error saving image: ", error);
      toast.error("Failed to save image.");
    }
  };

  // Trigger Edit Mode
  const handleEditClick = (image, e) => {
    e.stopPropagation(); // Prevent opening the carousel
    setEditImage(image);
    setShowForm(true);
  };

  // Handle Delete
  const handleDeleteClick = async (imageId, e) => {
    e.stopPropagation(); // Prevent opening the carousel
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await deleteDoc(doc(db, "images", imageId));
        toast.success("Image deleted successfully!");
      } catch (error) {
        console.error("Error deleting image: ", error);
        toast.error("Failed to delete image.");
      }
    }
  };

  // Handle Cancel Edit/Add Form
  const handleCancelForm = () => {
    setEditImage(null);
    setShowForm(false);
  };

  // Toggle Form Visibility for Add Image
  const handleToggleAddForm = () => {
    if (showForm && editImage) {
      // If editing, switch to Add mode instead of closing
      setEditImage(null);
    } else {
      setShowForm(!showForm);
    }
  };

  // Filter images locally
  const filteredImages = images.filter((img) =>
    img.title && img.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="images-list-container">
      {/* Upper Navigation / Actions Bar */}
      <div className="images-header">
        <button onClick={onBack} className="btn-back">
          &larr; Back
        </button>
        <h1 className="album-title-header">
          Images in <span>{album.name}</span>
        </h1>
        <div className="search-and-add">
          <input
            type="text"
            placeholder="Search images locally..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            onClick={handleToggleAddForm}
            className={`btn-toggle-add ${showForm && !editImage ? "active" : ""}`}
          >
            {showForm && !editImage ? "Cancel" : "Add image"}
          </button>
        </div>
      </div>

      {/* Conditionally render the ImageForm */}
      {showForm && (
        <ImageForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          editImage={editImage}
        />
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="spinner-wrapper">
          <Spinner size={60} spinnerColor="#4f46e5" spinnerWidth={4} visible={true} />
          <p className="loading-text">Loading images...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="no-data-card">
          <h3>No images found in this album</h3>
          <p>Click "Add image" to upload your first photo.</p>
        </div>
      ) : (
        <div className="images-grid">
          {filteredImages.map((img, idx) => (
            <div
              key={img.id}
              className="image-card"
              onClick={() => setCarouselIndex(idx)}
            >
              <div className="image-wrapper">
                <img src={img.url} alt={img.title} className="album-photo" />
                <div className="image-overlay">
                  <button
                    onClick={(e) => handleEditClick(img, e)}
                    className="action-btn edit-btn"
                    title="Update Image"
                  >
                    <img src={editIcon} alt="update" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(img.id, e)}
                    className="action-btn delete-btn"
                    title="Delete Image"
                  >
                    <img src={deleteIcon} alt="deleted" />
                  </button>
                </div>
              </div>
              <div className="image-info">
                <h4>{img.title}</h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conditional Carousel Modal */}
      {carouselIndex !== null && (
        <Carousel
          images={filteredImages}
          currentIndex={carouselIndex}
          onClose={() => setCarouselIndex(null)}
        />
      )}
    </div>
  );
}

export default ImagesList;
