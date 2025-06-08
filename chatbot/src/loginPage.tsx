import { useSearchParams } from "react-router";
import { useEffect } from "react";

const LoginPage = () => {
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

export default LoginPage;
