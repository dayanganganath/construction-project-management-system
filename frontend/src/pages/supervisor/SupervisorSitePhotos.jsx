import {
  useEffect,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import api from "../../services/api";

function SupervisorSitePhotos() {
  const {
    selectedProjectId,
  } = useOutletContext();

  const getToday = () => {
    const now = new Date();

    const year =
      now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
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
    }
  }, [selectedProjectId]);

  const loadPhotos = async () => {
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
        typeof error.response?.data ===
          "string"
          ? error.response.data
          : "Unable to load site photos."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    setError("");
    setSuccess("");
  };

  const handleFileChange = (e) => {
    const file =
      e.target.files?.[0] ||
      null;

    setForm({
      ...form,
      file,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

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

        const fileInput =
          document.getElementById(
            "site-photo-file"
          );

        if (fileInput) {
          fileInput.value = "";
        }

        await loadPhotos();
      } catch (error) {
        console.error(
          "Error uploading site photo:",
          error
        );

        setError(
          typeof error.response?.data ===
            "string"
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
    ).toLocaleDateString();
  };

  const getPhotoUrl = (
    photoId
  ) => {
    return `http://localhost:9090/api/site-photos/${photoId}/file`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            Site Photos
          </h1>

          <p>
            Upload and review
            project progress photos.
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
          Upload Site Photo
        </h2>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="progress-form">
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
                Select Category *
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

            <input
              id="site-photo-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleFileChange
              }
            />
          </div>

          <div
            style={{
              marginTop: "15px",
            }}
          >
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
              placeholder="Describe this photo..."
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
            style={{
              marginTop: "18px",
            }}
          >
            {saving
              ? "Uploading..."
              : "Upload Photo"}
          </button>
        </form>
      </div>

      <div className="form-card">
        <h2>
          Photo History
        </h2>

        {loading ? (
          <p>
            Loading photos...
          </p>
        ) : photos.length ===
          0 ? (
          <p>
            No site photos found.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "18px",
            }}
          >
            {photos.map(
              (photo) => (
                <div
                  key={
                    photo.id
                  }
                  className="form-card"
                  style={{
                    margin: 0,
                  }}
                >
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
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit:
                        "cover",
                      borderRadius:
                        "8px",
                      marginBottom:
                        "12px",
                    }}
                  />

                  <h3>
                    {photo.category ||
                      "Site Photo"}
                  </h3>

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

                  <p>
                    <strong>
                      Client Visible:
                    </strong>{" "}
                    {photo.clientVisible
                      ? "Yes"
                      : "No"}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SupervisorSitePhotos;