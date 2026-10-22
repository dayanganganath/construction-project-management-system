import {
  useEffect,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import api from "../../services/api";

import "../../styles/supervisor-site-polish.css";

function SupervisorSitePhotos() {
  const {
    selectedProjectId,
  } = useOutletContext();

  const getToday = () => {
    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        now.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const initialForm = {
    photoDate: getToday(),
    category: "",
    caption: "",
    file: null,
  };

  const [form, setForm] =
    useState(initialForm);

  const [photos, setPhotos] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (selectedProjectId) {
      loadPhotos();
    } else {
      setPhotos([]);
    }
  }, [selectedProjectId]);

  const loadPhotos =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/supervisor/projects/${selectedProjectId}/site-photos`
          );

        setPhotos(
          response.data || []
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

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setForm({
        ...form,
        [name]: value,
      });

      setError("");
      setSuccess("");
    };

  const handleFileChange =
    (event) => {
      const file =
        event.target
          .files?.[0] ||
        null;

      setForm({
        ...form,
        file,
      });

      setError("");
      setSuccess("");
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!selectedProjectId) {
        setError(
          "Please select a project."
        );

        return;
      }

      if (!form.photoDate) {
        setError(
          "Photo date is required."
        );

        return;
      }

      if (!form.category) {
        setError(
          "Photo category is required."
        );

        return;
      }

      if (!form.file) {
        setError(
          "Please select a photo."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const data =
          new FormData();

        data.append(
          "photoDate",
          form.photoDate
        );

        data.append(
          "category",
          form.category
        );

        data.append(
          "caption",
          form.caption.trim()
        );

        data.append(
          "file",
          form.file
        );

        await api.post(
          `/supervisor/projects/${selectedProjectId}/site-photos`,
          data,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        setSuccess(
          "Site photo uploaded successfully."
        );

        setForm({
          ...initialForm,
          photoDate:
            getToday(),
        });

        const input =
          document.getElementById(
            "site-photo-file"
          );

        if (input) {
          input.value = "";
        }

        await loadPhotos();
      } catch (error) {
        console.error(
          "Error uploading site photo:",
          error
        );

        setError(
          typeof error.response
            ?.data === "string"
            ? error.response.data
            : "Unable to upload site photo."
        );
      } finally {
        setSaving(false);
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
    ).toLocaleDateString(
      "en-GB"
    );
  };

  const getPhotoUrl = (
    photoId
  ) => {
    return `http://localhost:9090/api/site-photos/${photoId}/file`;
  };

  const visibleCount =
    photos.filter(
      (photo) =>
        Boolean(
          photo.clientVisible
        )
    ).length;

  return (
    <div className="supervisor-page">
      <div className="supervisor-page-heading">
        <div>
          <span className="supervisor-eyebrow">
            Site Documentation
          </span>

          <h2>
            Site Photos
          </h2>

          <p>
            Upload project progress
            photos and review the
            site photo history.
          </p>
        </div>

        <div className="supervisor-mini-status">
          <span>
            Total Photos
          </span>

          <strong>
            {photos.length}
          </strong>
        </div>
      </div>

      {error && (
        <div className="supervisor-form-alert supervisor-form-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="supervisor-form-alert supervisor-form-alert-success">
          {success}
        </div>
      )}

      <div className="supervisor-site-summary-grid">
        <div className="supervisor-site-summary-card">
          <span>
            Uploaded Photos
          </span>

          <strong>
            {photos.length}
          </strong>

          <small>
            Total site records
          </small>
        </div>

        <div className="supervisor-site-summary-card">
          <span>
            Client Visible
          </span>

          <strong>
            {visibleCount}
          </strong>

          <small>
            Shared with client
          </small>
        </div>

        <div className="supervisor-site-summary-card">
          <span>
            Internal Photos
          </span>

          <strong>
            {photos.length -
              visibleCount}
          </strong>

          <small>
            Management only
          </small>
        </div>
      </div>

      <section className="supervisor-form-card">
        <div className="supervisor-form-card-heading">
          <div>
            <h3>
              Upload Site Photo
            </h3>

            <p>
              Add a dated photo
              record for the
              selected project.
            </p>
          </div>

          <span className="supervisor-form-badge">
            Photo Upload
          </span>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="supervisor-form-grid supervisor-form-grid-three">
            <div className="supervisor-field">
              <label>
                Photo Date
              </label>

              <input
                type="date"
                name="photoDate"
                value={
                  form.photoDate
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="supervisor-field">
              <label>
                Category *
              </label>

              <select
                name="category"
                value={
                  form.category
                }
                onChange={
                  handleChange
                }
              >
                <option value="">
                  Select category
                </option>

                <option value="PROGRESS">
                  Progress
                </option>

                <option value="STRUCTURAL">
                  Structural
                </option>

                <option value="MASONRY">
                  Masonry
                </option>

                <option value="PLUMBING">
                  Plumbing
                </option>

                <option value="ELECTRICAL">
                  Electrical
                </option>

                <option value="WATERPROOFING">
                  Waterproofing
                </option>

                <option value="PAINTING">
                  Painting
                </option>

                <option value="TILING">
                  Tiling
                </option>

                <option value="MATERIAL">
                  Material
                </option>

                <option value="ISSUE">
                  Issue
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            <div className="supervisor-field">
              <label>
                Photo File *
              </label>

              <input
                id="site-photo-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleFileChange
                }
              />
            </div>
          </div>

          <div className="supervisor-field supervisor-field-full">
            <label>
              Caption
            </label>

            <textarea
              name="caption"
              value={
                form.caption
              }
              onChange={
                handleChange
              }
              placeholder="Describe this site photo..."
            />
          </div>

          <div className="supervisor-form-actions">
            <button
              type="submit"
              className="supervisor-primary-button"
              disabled={
                saving ||
                !selectedProjectId
              }
            >
              {saving
                ? "Uploading..."
                : "Upload Site Photo"}
            </button>
          </div>
        </form>
      </section>

      <section className="supervisor-form-card">
        <div className="supervisor-form-card-heading">
          <div>
            <h3>
              Photo History
            </h3>

            <p>
              Previously uploaded
              project site photos.
            </p>
          </div>

          {!loading && (
            <span className="supervisor-count-badge">
              {photos.length} photos
            </span>
          )}
        </div>

        {loading ? (
          <div className="supervisor-table-loading">
            Loading site photos...
          </div>
        ) : photos.length ===
          0 ? (
          <div className="supervisor-table-empty">
            <h4>
              No site photos
            </h4>

            <p>
              Uploaded project
              photos will appear
              here.
            </p>
          </div>
        ) : (
          <div className="supervisor-photo-grid">
            {photos.map(
              (photo) => (
                <article
                  className="supervisor-photo-card"
                  key={photo.id}
                >
                  <div className="supervisor-photo-image-wrap">
                    <img
                      src={
                        getPhotoUrl(
                          photo.id
                        )
                      }
                      alt={
                        photo.caption ||
                        "Site progress"
                      }
                    />

                    <span className="supervisor-photo-category">
                      {photo.category ||
                        "PHOTO"}
                    </span>
                  </div>

                  <div className="supervisor-photo-card-body">
                    <div className="supervisor-photo-card-meta">
                      <span>
                        {formatDate(
                          photo.photoDate
                        )}
                      </span>

                      <span
                        className={
                          photo.clientVisible
                            ? "supervisor-visibility-badge visible"
                            : "supervisor-visibility-badge internal"
                        }
                      >
                        {photo.clientVisible
                          ? "Client Visible"
                          : "Internal"}
                      </span>
                    </div>

                    <p>
                      {photo.caption ||
                        "No caption provided."}
                    </p>

                    <small>
                      Uploaded by{" "}
                      <strong>
                        {photo.uploadedBy ||
                          "-"}
                      </strong>
                    </small>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default SupervisorSitePhotos;