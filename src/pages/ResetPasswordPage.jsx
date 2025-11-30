import { useState } from "react";
import { supabase } from "../services/supabaseClient";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) return alert("Silakan masukkan email Anda.");

    setLoading(true);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://exhibitly-nu.vercel.app/update-password",
    });

    setLoading(false);

    if (error) {
      alert("Gagal mengirim email reset: " + error.message);
    } else {
      alert("Email reset password telah dikirim!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Reset Password
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Masukkan email Anda, kami akan mengirimkan link reset password.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="nama@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow transition"
          >
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
