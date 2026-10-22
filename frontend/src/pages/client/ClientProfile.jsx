import {
  useEffect,
  useRef,
  useState,
} from "react";

import api from "../../services/api";

import "../../styles/client-profile.css";

function ClientProfile({
  onBack,
  onProfileUpdated,
}) {
  const fileInputRef =
    useRef(null);

  const [profile, setProfile] =
    useState(null);

  const [
    profilePhotoUrl,
    setProfilePhotoUrl,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    profileForm,
    setProfileForm,
  ] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [
    passwordForm,
    setPasswordForm,
  ] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();

    return () => {
      if (profilePhotoUrl) {
        URL.revokeObjectURL(
          profilePhotoUrl
        );
      }
    };
  }, []);

  const getErrorMessage = (
    error,
    fallback
  ) => {
    if (
      typeof error.response?.data ===
      "string"
    ) {
      return error.response.data;
    }

    return (
      error.response?.data
        ?.message || fallback
    );
  };

  const loadProfile =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/client/profile"
          );

        const data =
          response.data;

        setProfile(data);

        setProfileForm({
          fullName:
            data?.fullName || "",
          email:
            data?.email || "",
          phone:
            data?.phone || "",
        });

        if (
          data?.photoAvailable
        ) {
          await loadProfilePhoto();
        } else {
          clearPhotoUrl();
        }
      } catch (error) {
        console.error(
          "Unable to load profile:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to load your profile."
          )
        );
      } finally {
        setLoading(false);
      }
    };

  const clearPhotoUrl = () => {
    setProfilePhotoUrl(
      (currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(
            currentUrl
          );
        }

        return "";
      }
    );
  };

  const loadProfilePhoto =
    async () => {
      try {
        const response =
          await api.get(
            "/client/profile/photo",
            {
              responseType:
                "blob",
            }
          );

        const objectUrl =
          URL.createObjectURL(
            response.data
          );

        setProfilePhotoUrl(
          (currentUrl) => {
            if (currentUrl) {
              URL.revokeObjectURL(
                currentUrl
              );
            }

            return objectUrl;
          }
        );
      } catch (error) {
        console.error(
          "Unable to load profile photo:",
          error
        );

        clearPhotoUrl();
      }
    };

  const notifyProfileUpdated =
    () => {
      window.dispatchEvent(
        new CustomEvent(
          "client-profile-updated"
        )
      );

      if (
        typeof onProfileUpdated ===
        "function"
      ) {
        onProfileUpdated();
      }
    };

  const handleProfileChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setProfileForm(
        (current) => ({
          ...current,
          [name]: value,
        })
      );
    };

  const handlePasswordChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setPasswordForm(
        (current) => ({
          ...current,
          [name]: value,
        })
      );
    };

  const handleProfileSubmit =
    async (event) => {
      event.preventDefault();

      try {
        setSaving(true);
        setError("");
        setMessage("");

        const response =
          await api.put(
            "/client/profile",
            profileForm
          );

        const updatedProfile =
          response.data
            ?.profile;

        if (updatedProfile) {
          setProfile(
            updatedProfile
          );

          setProfileForm({
            fullName:
              updatedProfile
                .fullName || "",
            email:
              updatedProfile
                .email || "",
            phone:
              updatedProfile
                .phone || "",
          });
        }

        setMessage(
          response.data
            ?.message ||
            "Profile updated successfully."
        );

        notifyProfileUpdated();
      } catch (error) {
        console.error(
          "Unable to update profile:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to update profile."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  const handleSelectPhoto =
    () => {
      fileInputRef.current
        ?.click();
    };

  const handlePhotoChange =
    async (event) => {
      const file =
        event.target.files?.[0];

      event.target.value = "";

      if (!file) {
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        setError(
          "Please select a JPG, PNG or WEBP image."
        );

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setError(
          "Profile photo must be 5 MB or smaller."
        );

        return;
      }

      try {
        setUploadingPhoto(true);
        setError("");
        setMessage("");

        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        const response =
          await api.post(
            "/client/profile/photo",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        if (
          response.data?.profile
        ) {
          setProfile(
            response.data
              .profile
          );
        }

        await loadProfilePhoto();

        setMessage(
          response.data
            ?.message ||
            "Profile photo updated successfully."
        );

        notifyProfileUpdated();
      } catch (error) {
        console.error(
          "Unable to upload profile photo:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to upload profile photo."
          )
        );
      } finally {
        setUploadingPhoto(
          false
        );
      }
    };

  const handleDeletePhoto =
    async () => {
      try {
        setUploadingPhoto(true);
        setError("");
        setMessage("");

        const response =
          await api.delete(
            "/client/profile/photo"
          );

        if (
          response.data?.profile
        ) {
          setProfile(
            response.data
              .profile
          );
        }

        clearPhotoUrl();

        setMessage(
          response.data
            ?.message ||
            "Profile photo removed successfully."
        );

        notifyProfileUpdated();
      } catch (error) {
        console.error(
          "Unable to delete profile photo:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to remove profile photo."
          )
        );
      } finally {
        setUploadingPhoto(
          false
        );
      }
    };

  const handlePasswordSubmit =
    async (event) => {
      event.preventDefault();

      try {
        setChangingPassword(
          true
        );

        setError("");
        setMessage("");

        const response =
          await api.put(
            "/client/profile/password",
            passwordForm
          );

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setMessage(
          response.data
            ?.message ||
            "Password changed successfully."
        );
      } catch (error) {
        console.error(
          "Unable to change password:",
          error
        );

        setError(
          getErrorMessage(
            error,
            "Unable to change password."
          )
        );
      } finally {
        setChangingPassword(
          false
        );
      }
    };

  const getInitial = () => {
    const source =
      profile?.fullName ||
      profile?.username ||
      "C";

    return source
      .charAt(0)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="client-profile-loading">
        Loading profile...
      </div>
    );
  }

  return (
    <section className="client-profile-page">
      <div className="client-profile-heading">
        <div>
          <button
            type="button"
            className="client-profile-back"
            onClick={onBack}
          >
            ← Back to Portal
          </button>

          <p className="client-profile-eyebrow">
            Account Settings
          </p>

          <h2>
            My Profile
          </h2>

          <p>
            Manage your personal
            information, profile
            photo and account
            security.
          </p>
        </div>
      </div>

      {error && (
        <div className="client-profile-alert client-profile-alert-error">
          {error}
        </div>
      )}

      {message && (
        <div className="client-profile-alert client-profile-alert-success">
          {message}
        </div>
      )}

      <div className="client-profile-grid">
        <div className="client-profile-main-column">
          <article className="client-profile-card client-profile-photo-card">
            <div className="client-profile-card-heading">
              <div>
                <h3>
                  Profile Photo
                </h3>

                <p>
                  This photo will
                  appear in your
                  client portal.
                </p>
              </div>
            </div>

            <div className="client-profile-photo-content">
              <div className="client-profile-photo-preview">
                {profilePhotoUrl ? (
                  <img
                    src={
                      profilePhotoUrl
                    }
                    alt="Client profile"
                  />
                ) : (
                  <span>
                    {getInitial()}
                  </span>
                )}
              </div>

              <div className="client-profile-photo-actions">
                <div>
                  <h4>
                    Upload a new
                    photo
                  </h4>

                  <p>
                    JPG, PNG or
                    WEBP. Maximum
                    file size 5 MB.
                  </p>
                </div>

                <div className="client-profile-button-row">
                  <button
                    type="button"
                    className="client-profile-primary-button"
                    onClick={
                      handleSelectPhoto
                    }
                    disabled={
                      uploadingPhoto
                    }
                  >
                    {uploadingPhoto
                      ? "Processing..."
                      : "Choose Photo"}
                  </button>

                  {profilePhotoUrl && (
                    <button
                      type="button"
                      className="client-profile-secondary-button client-profile-danger-button"
                      onClick={
                        handleDeletePhoto
                      }
                      disabled={
                        uploadingPhoto
                      }
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={
                    handlePhotoChange
                  }
                />
              </div>
            </div>
          </article>

          <article className="client-profile-card">
            <div className="client-profile-card-heading">
              <div>
                <h3>
                  Personal
                  Information
                </h3>

                <p>
                  Keep your contact
                  information up to
                  date.
                </p>
              </div>
            </div>

            <form
              onSubmit={
                handleProfileSubmit
              }
              className="client-profile-form"
            >
              <div className="client-profile-form-row">
                <div className="client-profile-field client-profile-field-full">
                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={
                      profileForm
                        .fullName
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="client-profile-form-row">
                <div className="client-profile-field">
                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      profileForm
                        .email
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="example@email.com"
                  />
                </div>

                <div className="client-profile-field">
                  <label>
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={
                      profileForm
                        .phone
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="07X XXX XXXX"
                  />
                </div>
              </div>

              <div className="client-profile-form-footer">
                <button
                  type="submit"
                  className="client-profile-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </article>

          <article className="client-profile-card">
            <div className="client-profile-card-heading">
              <div>
                <h3>
                  Change Password
                </h3>

                <p>
                  Use a strong
                  password with at
                  least 8
                  characters.
                </p>
              </div>

              <span className="client-profile-security-badge">
                Secure
              </span>
            </div>

            <form
              onSubmit={
                handlePasswordSubmit
              }
              className="client-profile-form"
            >
              <div className="client-profile-field client-profile-field-full">
                <label>
                  Current Password
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={
                    passwordForm
                      .currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  required
                  autoComplete="current-password"
                  placeholder="Enter current password"
                />
              </div>

              <div className="client-profile-form-row">
                <div className="client-profile-field">
                  <label>
                    New Password
                  </label>

                  <input
                    type="password"
                    name="newPassword"
                    value={
                      passwordForm
                        .newPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div className="client-profile-field">
                  <label>
                    Confirm New
                    Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={
                      passwordForm
                        .confirmPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <div className="client-profile-form-footer">
                <button
                  type="submit"
                  className="client-profile-primary-button"
                  disabled={
                    changingPassword
                  }
                >
                  {changingPassword
                    ? "Updating..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </article>
        </div>

        <aside className="client-profile-side-column">
          <article className="client-profile-card client-profile-account-card">
            <div className="client-profile-account-icon">
              {getInitial()}
            </div>

            <h3>
              {profile?.fullName ||
                profile?.username ||
                "Client"}
            </h3>

            <p>
              Client Account
            </p>

            <div className="client-profile-account-details">
              <div>
                <span>
                  Username
                </span>

                <strong>
                  {profile?.username ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Account Role
                </span>

                <strong>
                  {profile?.role ||
                    "CLIENT"}
                </strong>
              </div>

              <div>
                <span>
                  Email
                </span>

                <strong>
                  {profile?.email ||
                    "Not added"}
                </strong>
              </div>

              <div>
                <span>
                  Phone
                </span>

                <strong>
                  {profile?.phone ||
                    "Not added"}
                </strong>
              </div>
            </div>
          </article>

          <article className="client-profile-card client-profile-note-card">
            <div className="client-profile-note-icon">
              i
            </div>

            <div>
              <h4>
                Account Control
              </h4>

              <p>
                Your username,
                account role,
                account status and
                project access are
                managed by the
                system
                administrator.
              </p>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

export default ClientProfile;