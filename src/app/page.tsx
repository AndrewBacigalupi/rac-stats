"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const enteredPassword = formData.get("password")?.toString() ?? "";

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: enteredPassword }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Incorrect password. Please try again.");
      }

      router.push("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Incorrect password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20" style={{backgroundColor: '#483C32'}}>
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4" style={{color: '#91D2FD'}}>Tufts MBB In-Practice Statistics</h1>
          <p className="text-lg" style={{color: '#91D2FD', opacity: 0.9}}>Let's make a run!</p>
        </div>

        <div
          className="w-full max-w-sm rounded-2xl p-8 shadow-xl border"
          style={{ backgroundColor: "#2F241F", borderColor: "#91D2FD40" }}
        >
          <h2
            className="text-2xl font-bold text-center mb-6"
            style={{ color: "#91D2FD" }}
          >
            Enter Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="text-sm font-medium mb-2"
                style={{ color: "#91D2FD" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full px-4 py-2 pr-12 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "#3F332C",
                    borderColor: "#91D2FD40",
                    color: "#91D2FD",
                  }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  style={{ color: "#91D2FD", opacity: 0.7 }}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    // Eye with slash (hide password)
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    // Eye (show password)
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg font-semibold transition-all duration-300"
              style={{ backgroundColor: "#91D2FD", color: "#483C32" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Checking..." : "Login"}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-center text-sm" style={{ color: "#FF9F9F" }}>
              {error}
            </p>
          )}

          <p
            className="mt-6 text-xs text-center"
            style={{ color: "#91D2FD", opacity: 0.7 }}
          >
            Access the Tufts Men's Basketball statistics system
          </p>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 transition-colors duration-200"
          style={{color: '#91D2FD'}}
          href="https://www.tufts.edu/"
          target="_blank"
          rel="noopener noreferrer"
        >
          About Tufts
        </a>
         <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 transition-colors duration-200"
          style={{color: '#91D2FD'}}
          href="https://gotuftsjumbos.com/sports/mens-basketball"
          target="_blank"
          rel="noopener noreferrer"
        >
          Team Site
        </a>
       
      </footer>
    </div>
  );
}
