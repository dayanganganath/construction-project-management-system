import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";

function SitePhotos() {
  const [projects, setProjects] =
    useState([]);

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState("");

  const [photos, setPhotos] =
    useState([]);

  const [imageUrls, setImageUrls] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadPhotos(
        selectedProjectId
      );
    } else {
      clearImageUrls();
      setPhotos([]);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    return () => {
      clearImageUrls();
    };
  }, []);

  const clearImageUrls = () => {
    Object.values(
      imageUrls
    ).forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setImageUrls({});
  };

  const loadProjects =
    async () => {
      try {
        setError("");

        const response =
          await api.get(
            "/projects"
          );

        const data =
          response.data || [];

        setProjects(data);

        if (data.length > 0) {
          setSelectedProjectId(
            String(
              data[0].id
            )
          );
        }
      } catch (error) {
        console.error(
          "Error loading projects:",
          error
        );

        setError(
          "Unable to load projects."
        );
      }
    };

  const loadPhotos =
    async (projectId) => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response =
          await api.get(
            `/site-photos/project/${projectId}`
          );

        const data =
          response.data || [];

        setPhotos(data);

        await loadPhotoImages(
          data
        );
      } catch (error) {
        console.error(
          "Error loading site photos:",
          error
        );

        setError(
          typeof error.response
            ?.data === "string"
            ? error.response.data
            : "Unable to load site photos."
        );
      } finally {
        setLoading(false);
      }
    };

  const loadPhotoImages =
    async (photoList) => {
      Object.values(
        imageUrls
      ).forEach((url) => {
        URL.revokeObjectURL(
          url
        );
      });

      const urls = {};

      for (const photo of photoList) {
        try {
          const response =
            await api.get(
              `/site-photos/${photo.id}/file`,
              {
                responseType:
                  "blob",
              }
            );

          urls[photo.id] =
            URL.createObjectURL(
              response.data
            );
        } catch (error) {
          console.error(
            `Unable to load photo ${photo.id}`,
            error
          );
        }
      }

      setImageUrls(urls);
    };

  const toggleClientVisibility =
    async (photo) => {
      try {
        setUpdatingId(
          photo.id
        );

        setError("");
        setSuccess("");

        const newValue =
          !photo.clientVisible;

        await api.put(
          `/site-photos/${photo.id}/client-visible`,
          {
            clientVisible:
              newValue,
          }
        );

        setPhotos(
          (currentPhotos) =>
            currentPhotos.map(
              (item) =>
                item.id ===
                photo.id
                  ? {
                      ...item,
                      clientVisible:
                        newValue,
                    }
                  : item
            )
        );

        setSuccess(
          newValue
            ? "Photo is now visible to the client."
            : "Photo removed from client view."
        );
      } catch (error) {
        console.error(
          "Error updating photo visibility:",
          error
        );

        setError(
          typeof error.response
            ?.data === "string"
            ? error.response.data
            : "Unable to update photo visibility."
        );
      } finally {
        setUpdatingId(
          null
        );
      }
    };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Site Photos
          </h1>

          <p>
            Review project site
            photos and control
            client visibility.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="form-card">
        <h2>
          Select Project
        </h2>

        <div
          style={{
            maxWidth: "500px",
          }}
        >
          <label>
            Project / Site
          </label>

          <select
            value={
              selectedProjectId
            }
            onChange={(e) =>
              setSelectedProjectId(
                e.target.value
              )
            }
          >
            <option value="">
              Select Project
            </option>

            {projects.map(
              (project) => (
                <option
                  key={
                    project.id
                  }
                  value={
                    project.id
                  }
                >
                  {
                    project.projectName
                  }

                  {project.location
                    ? ` - ${project.location}`
                    : ""}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div
        className="form-card"
        style={{
          marginTop: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: "15px",
            marginBottom:
              "20px",
          }}
        >
          <div>
            <h2>
              Project Photos
            </h2>

            <p>
              {photos.length} photo(s)
            </p>
          </div>
        </div>

        {loading ? (
          <p>
            Loading photos...
          </p>
        ) : !selectedProjectId ? (
          <p>
            Please select a
            project.
          </p>
        ) : photos.length === 0 ? (
          <p>
            No site photos
            found for this
            project.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >
            {photos.map(
              (photo) => (
                <div
                  key={
                    photo.id
                  }
                  style={{
                    background:
                      "#ffffff",
                    border:
                      "1px solid #e5e7eb",
                    borderRadius:
                      "12px",
                    overflow:
                      "hidden",
                  }}
                >
                  {imageUrls[
                    photo.id
                  ] ? (
                    <img
                      src={
                        imageUrls[
                          photo.id
                        ]
                      }
                      alt={
                        photo.caption ||
                        "Site photo"
                      }
                      style={{
                        width:
                          "100%",
                        height:
                          "220px",
                        objectFit:
                          "cover",
                        display:
                          "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height:
                          "220px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          "#f3f4f6",
                      }}
                    >
                      Photo unavailable
                    </div>
                  )}

                  <div
                    style={{
                      padding:
                        "16px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap:
                          "10px",
                        marginBottom:
                          "12px",
                      }}
                    >
                      <strong>
                        {photo.category ||
                          "SITE PHOTO"}
                      </strong>

                      <span
                        style={{
                          fontSize:
                            "12px",
                          fontWeight:
                            "600",
                        }}
                      >
                        {photo.clientVisible
                          ? "CLIENT VISIBLE"
                          : "INTERNAL"}
                      </span>
                    </div>

                    <p>
                      <strong>
                        Date:
                      </strong>{" "}
                      {formatDate(
                        photo.photoDate
                      )}
                    </p>

                    <p>
                      <strong>
                        Caption:
                      </strong>{" "}
                      {photo.caption ||
                        "-"}
                    </p>

                    <p>
                      <strong>
                        Uploaded By:
                      </strong>{" "}
                      {photo.uploadedBy ||
                        "-"}
                    </p>

                    <button
                      type="button"
                      className={
                        photo.clientVisible
                          ? "cancel-button"
                          : "primary-button"
                      }
                      disabled={
                        updatingId ===
                        photo.id
                      }
                      onClick={() =>
                        toggleClientVisibility(
                          photo
                        )
                      }
                      style={{
                        marginTop:
                          "10px",
                        width:
                          "100%",
                      }}
                    >
                      {updatingId ===
                      photo.id
                        ? "Updating..."
                        : photo.clientVisible
                        ? "Remove From Client"
                        : "Make Client Visible"}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SitePhotos;