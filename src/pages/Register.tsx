import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Registration is now handled via OAuth on the Login page
// This page just redirects to Login
const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
};

export default Register;
