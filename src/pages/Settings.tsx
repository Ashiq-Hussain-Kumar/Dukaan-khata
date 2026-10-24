
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  UserRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  LockKeyhole,
} from "lucide-react";

import { focusField } from "../utils/focusField";
import { api, ApiRequestError } from "../utils/api";
import SnackBar, { type SnackbarType } from "../components/SnackBar";

const inputClass =
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70";

const labelClass = "mb-2 block text-sm font-medium text-[#374151]";

type SnackbarState = {
  message: string;
  type: SnackbarType;
} | null;

function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [saved, setSaved] = useState({
    name: "",
    phone: "",
  });

  const [snackbar, setSnackbar] = useState<SnackbarState>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const showSnackbar = (
    message: string,
    type: SnackbarType = "error"
  ) => {
    setSnackbar({ message, type });
  };

  const closeSnackbar = useCallback(() => {
    setSnackbar(null);
  }, []);

  // Load the current shopkeeper profile.
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await api.get<{
          name: string;
          email: string;
          phone: string;
        }>("/shopkeepers/me");

        if (cancelled) return;

        const name = data.name ?? "";
        const phone = data.phone ?? "";

        setProfile({
          name,
          email: data.email ?? "",
          phone,
        });

        setSaved({ name, phone });
      } catch (error) {
        if (cancelled) return;

        showSnackbar(
          error instanceof ApiRequestError
            ? error.message
            : "Could not load your profile."
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSavingProfile || isLoading) return;

    const name = profile.name.trim();
    const phone = profile.phone.trim();

    if (name.length < 2 || name.length > 50) {
      showSnackbar("Name must be between 2 and 50 characters.");
      focusField(nameInputRef);
      return;
    }

    if (!phone) {
      showSnackbar("Phone number is required.");
      focusField(phoneInputRef);
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");

if (phoneDigits.length !== 10) {
  showSnackbar("Phone number must contain exactly 10 digits.");
  focusField(phoneInputRef);
  return;
}

    if (name === saved.name && phone === saved.phone) {
      showSnackbar("No changes to save.");
      return;
    }

    setIsSavingProfile(true);

    try {
      await api.patch("/shopkeepers/me", { name, phone });

      setProfile((prev) => ({
        ...prev,
        name,
        phone,
      }));

      setSaved({ name, phone });

      showSnackbar("Profile updated successfully.", "success");
    } catch (error) {
      showSnackbar(
        error instanceof ApiRequestError
          ? error.message
          : "Failed to update profile."
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSavingPassword) return;

    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showSnackbar("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      showSnackbar("New password must be between 8 and 72 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showSnackbar("New password and confirmation do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      showSnackbar("New password must differ from your current password.");
      return;
    }

    setIsSavingPassword(true);

    try {
      // Make sure this endpoint and payload match your backend.
      await api.post("/shopkeepers/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });

      showSnackbar("Password changed successfully.", "success");
    } catch (error) {
      showSnackbar(
        error instanceof ApiRequestError
          ? error.message
          : "Could not change the password."
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  const togglePassword = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const renderPasswordField = (
    label: string,
    name: keyof typeof passwords,
    field: keyof typeof showPasswords
  ) => (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPasswords[field] ? "text" : "password"}
          value={passwords[name]}
          onChange={handlePasswordChange}
          className={`${inputClass} pr-12`}
          placeholder={`Enter ${label.toLowerCase()}`}
          autoComplete={
            field === "current" ? "current-password" : "new-password"
          }
          required
          disabled={isSavingPassword}
        />

        <button
          type="button"
          onClick={() => togglePassword(field)}
          aria-label={showPasswords[field] ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#6B7280] transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isSavingPassword}
        >
          {showPasswords[field] ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm text-[#6B7280]">
          Manage your account details and security preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <section className="overflow-hidden rounded-2xl border border-[#EDEEF2] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#EDEEF2] px-5 py-5 sm:px-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserRound size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-[#111827]">
              Profile Settings
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Update your personal information.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="space-y-5 p-5 sm:p-7"
        >
          {isLoading ? (
            <p className="text-sm text-gray-500" role="status">
              Loading profile...
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full name
                </label>

                <input
                  id="name"
                  ref={nameInputRef}
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className={inputClass}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  disabled={isSavingProfile}
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  className={`${inputClass} cursor-not-allowed bg-gray-50 text-gray-500`}
                  autoComplete="email"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Email can’t be changed.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="phone" className={labelClass}>
                  Phone number
                </label>

                <input
                  id="phone"
                  ref={phoneInputRef}
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className={inputClass}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  required
                  disabled={isSavingProfile}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-[#EDEEF2] pt-5">
            <button
              type="submit"
              disabled={isLoading || isSavingProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Security Settings */}
      <section className="overflow-hidden rounded-2xl border border-[#EDEEF2] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#EDEEF2] px-5 py-5 sm:px-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-[#111827]">
              Security Settings
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Keep your account secure by updating your password.
            </p>
          </div>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-5 p-5 sm:p-7"
        >
          {renderPasswordField(
            "Current password",
            "currentPassword",
            "current"
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {renderPasswordField("New password", "newPassword", "new")}

            {renderPasswordField(
              "Confirm new password",
              "confirmPassword",
              "confirm"
            )}
          </div>

          <p className="text-xs text-[#6B7280]">
            Use 8 to 72 characters for your new password.
          </p>

          <div className="flex justify-end border-t border-[#EDEEF2] pt-5">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole size={17} />
              {isSavingPassword ? "Saving..." : "Change Password"}
            </button>
          </div>
        </form>
      </section>

      {/* Shared notification for both settings forms */}
      <SnackBar
        message={snackbar?.message ?? ""}
        type={snackbar?.type ?? "error"}
        onClose={closeSnackbar}
      />
    </div>
  );
}

export default Settings;
