import { useSearchParams } from "react-router";
import { useEffect } from "react";

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  useEffect(() => {
    window.location.href = `/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(
      returnUrl
    )}`;
  }, [returnUrl]);
  console.log("Login page triggered");
  return <div>Redirecting to Microsoft Entra ID...</div>;
};

export const LogoutPage = () => {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  useEffect(() => {
    window.location.href = "/.auth/logout";
  }, [returnUrl]);
  console.log("Logout page triggered");
  return <div>Logging off</div>;
};
