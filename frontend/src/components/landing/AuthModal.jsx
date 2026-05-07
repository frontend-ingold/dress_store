import { useState } from "react";

function AuthModal({
  mode,
  onModeChange,
  onClose,
  onGuest,
  onLogin,
  onRegister,
  onForgotPassword,
  onResetPassword,
  errorMessage,
  infoMessage
}) {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [forgotForm, setForgotForm] = useState({
    email: ""
  });
  const [resetForm, setResetForm] = useState({
    token: "",
    password: ""
  });

  function handleSubmit(event) {
    event.preventDefault();

    if (mode === "register") {
      onRegister(registerForm);
      return;
    }

    if (mode === "forgot") {
      onForgotPassword(forgotForm);
      return;
    }

    if (mode === "reset") {
      onResetPassword(resetForm);
      return;
    }

    onLogin(loginForm);
  }

  return (
    <div
      className="auth-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="auth-modal-card">
        <button
          type="button"
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close login popup"
        >
          x
        </button>

        <p className="section-subtitle">Continue to shop</p>
        <h2 id="auth-modal-title" className="auth-modal-title">
          Sign in before checkout actions
        </h2>
        <p className="auth-modal-copy">
          Login, create an account, or continue as a guest to keep shopping.
        </p>

        <div className="auth-modal-tabs">
          <button
            type="button"
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => onModeChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "auth-tab active" : "auth-tab"}
            onClick={() => onModeChange("register")}
          >
            Register
          </button>
        </div>

        {infoMessage ? <p className="catalog-status auth-modal-info">{infoMessage}</p> : null}
        {errorMessage ? <p className="catalog-status error auth-modal-error">{errorMessage}</p> : null}

        <form className="auth-modal-form" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <input
              type="text"
              placeholder="Full name"
              value={registerForm.name}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          ) : null}

          {mode === "forgot" ? (
            <input
              type="email"
              placeholder="Email address"
              value={forgotForm.email}
              onChange={(event) =>
                setForgotForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          ) : null}

          {mode === "reset" ? (
            <>
              <input
                type="text"
                placeholder="Reset token"
                value={resetForm.token}
                onChange={(event) =>
                  setResetForm((current) => ({ ...current, token: event.target.value }))
                }
              />
              <input
                type="password"
                placeholder="New password"
                value={resetForm.password}
                onChange={(event) =>
                  setResetForm((current) => ({ ...current, password: event.target.value }))
                }
              />
            </>
          ) : null}

          {mode !== "forgot" && mode !== "reset" ? (
            <>
              <input
                type="email"
                placeholder="Email address"
                value={mode === "register" ? registerForm.email : loginForm.email}
                onChange={(event) =>
                  mode === "register"
                    ? setRegisterForm((current) => ({ ...current, email: event.target.value }))
                    : setLoginForm((current) => ({ ...current, email: event.target.value }))
                }
              />

              <input
                type="password"
                placeholder="Password"
                value={mode === "register" ? registerForm.password : loginForm.password}
                onChange={(event) =>
                  mode === "register"
                    ? setRegisterForm((current) => ({ ...current, password: event.target.value }))
                    : setLoginForm((current) => ({ ...current, password: event.target.value }))
                }
              />
            </>
          ) : null}

          <button type="submit" className="catalog-banner-link primary auth-submit-button">
            {mode === "register"
              ? "Create account"
              : mode === "forgot"
                ? "Send reset token"
                : mode === "reset"
                  ? "Reset password"
                  : "Login"}
          </button>
        </form>

        {mode === "login" ? (
          <button
            type="button"
            className="auth-inline-link"
            onClick={() => onModeChange("forgot")}
          >
            Forgot password?
          </button>
        ) : null}

        {mode === "forgot" ? (
          <button
            type="button"
            className="auth-inline-link"
            onClick={() => onModeChange("reset")}
          >
            Already have a reset token?
          </button>
        ) : null}

        {mode === "login" || mode === "register" ? (
          <button type="button" className="auth-guest-button" onClick={onGuest}>
            Continue as guest
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default AuthModal;
