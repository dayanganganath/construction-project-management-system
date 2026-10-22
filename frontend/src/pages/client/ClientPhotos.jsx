import {
  useEffect,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import api from "../../services/api";

function ClientPhotos() {
  const {
    selectedProjectId,
    formatDate,
  } = useOutletContext();

  const [photos, setPhotos] =
    useState([]);

  const [photoUrls, setPhotoUrls] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (selectedProjectId) {
      loadPhotos();
    }

    return () => {
      revokeUrls(
        photoUrls
      );
    };
  }, [selectedProjectId]);

  const revokeUrls = (
    urls
  ) => {
    Object.values(
      urls || {}
    ).forEach((url) => {
      try {
        URL.revokeObjectURL(
          url
        );
      } catch {
        // Ignore cleanup errors.
      }
    });
  };

  const loadPhotos =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/client/projects/${selectedProjectId}/site-photos`
          );

        const list =
          response.data || [];

        setPhotos(list);

        const newUrls = {};

        for (const photo of list) {
          try {
            const fileResponse =
              await api.get(
                `/client/projects/${selectedProjectId}/site-photos/${photo.id}/file`,
                {
                  responseType:
                    "blob",
                }
              );

            newUrls[photo.id] =
              URL.createObjectURL(
                fileResponse.data
              );
          } catch (error) {
            console.error(
              "Unable to load photo:",
              error
            );
          }
        }

        setPhotoUrls(
          (current) => {
            revokeUrls(
              current
            );

            return newUrls;
          }
        );
      } catch (error) {
        console.error(
          "Unable to load photos:",
          error
        );

        setPhotos([]);

        setError(
          "Unable to load site photos."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="client-page">
      <div className="client-page-heading">
        <div>
          <span className="client-eyebrow">
            Project Gallery
          </span>

          <h2>
            Site Photos
          </h2>

          <p>
            Approved construction
            progress photos shared
            with you.
          </p>
        </div>

        {!loading && (
          <span className="client-count-badge">
            {photos.length} photos
          </span>
        )}
      </div>

      {error && (
        <div className="client-alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="client-page-loading">
          Loading site photos...
        </div>
      ) : photos.length === 0 ? (
        <div className="client-empty-card">
          <h3>
            No site photos yet
          </h3>

          <p>
            Approved site progress
            photos will appear here.
          </p>
        </div>
      ) : (
        <div className="client-photo-grid">
          {photos.map(
            (photo) => (
              <article
                className="client-photo-card"
                key={photo.id}
              >
                {photoUrls[
                  photo.id
                ] ? (
                  <img
                    src={
                      photoUrls[
                        photo.id
                      ]
                    }
                    alt={
                      photo.caption ||
                      "Site progress"
                    }
                  />
                ) : (
                  <div className="client-photo-placeholder">
                    Photo unavailable
                  </div>
                )}

                <div className="client-photo-info">
                  <div className="client-photo-meta">
                    <span>
                      {photo.category ||
                        "SITE PHOTO"}
                    </span>

                    <time>
                      {formatDate(
                        photo.photoDate
                      )}
                    </time>
                  </div>

                  <p>
                    {photo.caption ||
                      "Project site progress photo."}
                  </p>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default ClientPhotos;