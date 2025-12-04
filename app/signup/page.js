"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");

  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [major, setmajor] = useState("");
  const [mNumber, setmNumber] = useState("");

  const [error, seterror] = useState("");
  const router = useRouter();

  function isValidUcEmail(email) {
    const regex = /^[A-Za-z0-9._%+-]+@mail\.uc\.edu$/;
    return regex.test(email);
  }

  function isValidPassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(password);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !firstName.trim() ||
      !lastName.trim()
    ) {
      seterror("Please fill in all fields");
      return;
    }

    if (!isValidUcEmail(email)) {
      seterror("Email must be a valid @mail.uc.edu email");
      return;
    }

    if (!isValidPassword(password)) {
      seterror("Please enter a valid password. at least 6 alpa-numeric chars");
      return;
    }

    if (password !== confirmPassword) {
      seterror("Password does not match.");
      return;
    }

    seterror("");

      const registrationData = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password,
          // Always register as normal USER (id=2)
          userTypeId: 2
      };

    try {
      const res = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(registrationData),
          credentials: 'include'
      });

        if (!res.ok) {
            const errorData = await res.json();
            seterror(errorData.message || "An error occurred.");
            return;
        }
        const data = await res.json();
        console.log("Registration successful:", data);

        alert("Registration complete! Please log in.");
        router.push("/login");

      console.log(data);
    } catch (error) {
      console.log(error);

      seterror("an error occured");
    }
  }
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-md mx-auto p-6 rounded-md border bg-[color:var(--panel)]">
        <h1 className="text-2xl font-semibold mb-4">Create an Account</h1>

        {error.trim() && (
          <span className="mb-5 block text-lg text-red-500 font-bold">
            {error}
          </span>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-row gap-x-2">
            <input
              value={firstName}
              onChange={(e) => setfirstName(e.target.value)}
              className="px-3 py-2 border rounded"
              type="name"
              placeholder="First Name"
            />
            <input
              value={lastName}
              onChange={(e) => setlastName(e.target.value)}
              className="px-3 py-2 border rounded"
              type="name"
              placeholder="Last Name"
            />
          </div>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border rounded"
            type="email"
            placeholder="Enter email"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 border rounded"
            type="password"
            placeholder="Enter Password"
          />

          <input
            value={confirmPassword}
            onChange={(e) => setconfirmPassword(e.target.value)}
            className="px-3 py-2 border rounded"
            type="password"
            placeholder="Confirm Password"
          />

          <div className="flex justify-end">
            <button
              className="btn-primary px-4 py-2 rounded mt-2"
              type="submit"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
