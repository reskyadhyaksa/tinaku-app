"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogIn, User as UserIcon, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username: username.toLowerCase(), password });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 border border-pink-100">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
            <LogIn className="text-pink-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Selamat Datang</h1>
          <p className="text-gray-500 text-sm">Masuk ke sistem TINAKU</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-700 border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none"
                placeholder="Username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-700 border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-pink-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Sedang Masuk...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-gray-400 text-sm">
            Ibu Hamil belum punya akun? <br/>
            <a href="/register" className="text-pink-500 font-bold hover:underline">Daftar di sini</a>
          </p>
        </div>
      </div>
    </div>
  );
}
