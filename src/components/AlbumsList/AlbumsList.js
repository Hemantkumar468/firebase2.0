import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, addDoc } from "firebase/firestore";
import { db } from "../../firebaseInit";
import AlbumForm from "../AlbumForm/AlbumForm";
import ImagesList from "../ImagesList/ImagesList";
import Spinner from "react-spinner-material";
import { toast } from "react-toastify";
import "./AlbumsList.css";

function AlbumsList() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Retrieve albums from Firestore in real-time
  useEffect(() => {
    setLoading(true);
    const albumsRef = collection(db, "albums");
    const q = query(albumsRef);

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort locally by createdAt desc to avoid requiring firestore index
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setAlbums(list);
        setLoading(false);

        // Defensive check: If there's no album with name "first", create it.
        const hasFirstAlbum = list.some((album) => album.name && album.name.toLowerCase() === "first");
        if (!hasFirstAlbum && list.length === 0) {
          try {
            await addDoc(collection(db, "albums"), {
              name: "first",
              createdAt: Date.now(),
            });
            console.log("Defensive: Created 'first' album successfully.");
          } catch (err) {
            console.error("Defensive: Error creating 'first' album: ", err);
          }
        }
      },
      (error) => {
        console.error("Error fetching albums: ", error);
        toast.error("Failed to load albums.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle album creation
  const handleCreateAlbum = async (name) => {
    try {
      // Check if album name already exists (case-insensitive)
      const exists = albums.some(
        (alb) => alb.name && alb.name.toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        toast.warn("An album with this name already exists.");
        return;
      }

      await addDoc(collection(db, "albums"), {
        name,
        createdAt: Date.now(),
      });
      toast.success("Album created successfully!");
      setShowForm(false);
    } catch (error) {
      console.error("Error creating album: ", error);
      toast.error("Failed to create album.");
    }
  };

  // If an album is selected, render the ImagesList instead
  if (selectedAlbum) {
    return (
      <ImagesList
        album={selectedAlbum}
        onBack={() => setSelectedAlbum(null)}
      />
    );
  }

  return (
    <div className="albums-list-container">
      {/* Top Banner/Action Bar */}
      <div className="albums-header">
        <h1 className="logo-title">
          Photo<span>Folio</span>
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`btn-add-album ${showForm ? "active" : ""}`}
        >
          {showForm ? "Cancel" : "Add album"}
        </button>
      </div>

      {/* Conditionally render the AlbumForm */}
      {showForm && (
        <AlbumForm
          onCreateAlbum={handleCreateAlbum}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="section-title">
        <h2>Your Albums</h2>
      </div>

      {loading ? (
        <div className="spinner-wrapper">
          <Spinner size={60} spinnerColor="#4f46e5" spinnerWidth={4} visible={true} />
          <p className="loading-text">Loading albums...</p>
        </div>
      ) : albums.length === 0 ? (
        <div className="no-data-card">
          <h3>No albums found</h3>
          <p>Click "Add album" to create your very first digital album.</p>
        </div>
      ) : (
        <div className="albums-grid">
          {albums.map((album) => (
            <div
              key={album.id}
              className="album-card"
              onClick={() => setSelectedAlbum(album)}
            >
              <div className="album-icon-wrapper">
                <svg
                  viewBox="0 0 24 24"
                  className="album-folder-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="album-details">
                <h3>{album.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlbumsList;
