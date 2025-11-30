import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

const UpdatePasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!password || !confirm) {
      return alert("Password baru dan konfirmasi harus diisi.");
    }

    if (password !== confirm) {
      return alert("Konfirmasi password tidak cocok.");
    }

    setLoading(true);

    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      alert("Gagal memperbarui password: " + error.message);
    } else {
      alert("Password berhasil diperbarui!");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
          Atur Password Baru
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Masukkan password baru Anda di bawah ini
        </p>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm font-medium dark:text-gray-300">
              Password Baru
            </label>
            <input
              type="password"
              className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Password baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium dark:text-gray-300">
              Konfirmasi Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Ulangi password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow transition"
          >
            {loading ? "Memperbarui..." : "Perbarui Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
