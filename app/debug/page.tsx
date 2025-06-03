'use client';

import React, { useState, useEffect } from 'react';

export default function DebugPage() {
  const [authStatus, setAuthStatus] = useState('checking...');
  const [tokenInfo, setTokenInfo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthStatus(`Authenticated as: ${data.user.email} (${data.user.role})`);
        setTokenInfo(JSON.stringify(data.user, null, 2));
      } else {
        setAuthStatus('Not authenticated');
        setTokenInfo('No valid token found');
      }
    } catch (err) {
      setError('Error checking auth: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const clearCookies = async () => {
    try {
      await fetch('/api/auth/logout');
      setAuthStatus('Cookies cleared');
      setTokenInfo('');
      setTimeout(checkAuth, 1000);
    } catch (err) {
      setError('Error clearing cookies: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@localhost.com',
          password: 'admin123'
        }),
        credentials: 'include'
      });

      const data = await response.json();
      if (response.ok) {
        setAuthStatus('Login successful!');
        setTimeout(checkAuth, 500);
      } else {
        setError('Login failed: ' + data.message);
      }
    } catch (err) {
      setError('Login error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Auth Status</h2>
          <p className="mb-2"><strong>Status:</strong> {authStatus}</p>
          {tokenInfo && (
            <div className="mb-4">
              <strong>User Info:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-auto">
                {tokenInfo}
              </pre>
            </div>
          )}
          {error && (
            <div className="text-red-600 mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={checkAuth}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Check Auth Status
            </button>
            <button
              onClick={testLogin}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Login
            </button>
            <button
              onClick={clearCookies}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Cookies
            </button>
          </div>
        </div>

        <div className="mt-6">
          <a href="/login" className="text-blue-500 hover:underline">← Back to Login</a>
        </div>
      </div>
    </div>
  );
}