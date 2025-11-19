import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminLoginPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/admin";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            navigate(from, { replace: true });
        } else {
            setError('Nesprávné heslo.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
                <div>
                    <h2 className="text-3xl font-extrabold text-center text-gray-900">Přihlášení do administrace</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="password-admin" className="sr-only">Heslo</label>
                        <input
                            id="password-admin"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-purple focus:border-brand-purple"
                            placeholder="Heslo"
                        />
                    </div>
                    {error && <p className="text-sm text-center text-red-600">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-purple hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple"
                        >
                            Přihlásit se
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
