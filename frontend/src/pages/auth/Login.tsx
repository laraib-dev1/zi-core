import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { Button } from "@/components/ui/buttons/Button";
import Input from "@/pages/admin/components/form/Input";
import PasswordInput from "@/components/auth/PasswordInput";
import { loginUser } from "@/api/auth.api";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [waitingAccess, setWaitingAccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); 
  const handleLogin = async () => {
  try {
    setWaitingAccess(false);
    setError("");
    const data = await loginUser({ email, password });

    // check previous page user came from
    const from = location.state?.from;

    const role = data.user.role?.toLowerCase();
    const hasOperatorAccess = !!data.user.adminAccess;

      if (role !== "admin" && !hasOperatorAccess) {
        setWaitingAccess(true);
        setError("Please wait for admin access approval.");
        return;
      }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    login({ ...data.user, token: data.token });

      if (role === "admin" || hasOperatorAccess) {
        // Redirect admin to dashboard
        return navigate("/admin/dashboard");
      }
    // if user came from a protected page → redirect back there
    if (from) {
      return navigate(from);
    }

    // otherwise → go to landing page
    navigate("/");
  } catch (err: any) {
    setError(err.response?.data?.message || "Login failed");
  }
};


  return (
    <AuthLayout>
      {location.state?.message && (
        <p className="text-green-600 mb-2">{location.state.message}</p>
      )}

      <form
        className="flex flex-col gap-4 text-gray-800"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <div>
          <h2 className="text-2xl font-semibold text-[var(--theme-primary,#A8734B)] mb-2">
            Welcome Back!
          </h2>
          <p className="text-sm text-gray-600">
            Log in to continue your journey.
          </p>
        </div>

        <Input
          label="Email"
          placeholder="Enter email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className="text-gray-800"
        />

        <PasswordInput
          label="Password"
          placeholder="Enter password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end text-sm text-[var(--theme-primary,#A8734B)]">
          <Link to="/forgot" className="underline">
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          className="mt-2 w-full text-white rounded-lg py-3 border border-transparent transition-colors"
          style={{ backgroundColor: "var(--theme-primary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--theme-dark)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--theme-primary)";
          }}
        >
          {waitingAccess ? "Wait for access" : "Login"}
        </Button>

        <p className="text-sm text-white mt-1">
          Don’t have an account?{" "}
          <Link to="/access" className="text-white font-medium underline underline-offset-2 hover:opacity-90">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
