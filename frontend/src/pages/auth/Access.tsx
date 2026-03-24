import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { Button } from "@/components/ui/buttons/Button";
import Input from "@/pages/admin/components/form/Input";
import PasswordInput from "@/components/auth/PasswordInput";
import { registerUser } from "@/api/auth.api";

export default function Access() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegister = async () => {
    try {
      await registerUser({ name, email, password });
      navigate("/login", { state: { message: "Signup successful! Please login." } });
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
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
          handleRegister();
        }}
      >
        <div>
          <h2 className="text-2xl font-semibold text-[var(--theme-primary,#A8734B)] mb-2">
            Create Account
          </h2>
          <p className="text-sm text-gray-600">
            Join us to discover handcrafted essentials.
          </p>
        </div>

        <Input
          label="Full Name"
          placeholder="Enter name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          className="text-gray-800"
        />
        <Input
          label="Email"
          placeholder="Enter email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className="text-gray-800"
        />

        <PasswordInput
          label="Password"
          placeholder="Create password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

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
          Sign Up
        </Button>

        <p className="text-sm text-white mt-1">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-medium underline underline-offset-2 hover:opacity-90">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
