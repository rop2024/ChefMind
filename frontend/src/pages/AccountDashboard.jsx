import React from 'react';

const AccountDashboard = () => {
  // Dummy user info, replace with real user data as needed
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User', email: 'user@email.com' };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-orange-600">Account Dashboard</h2>
      <div className="mb-4">
        <div className="font-semibold text-gray-700">Name:</div>
        <div className="text-gray-900">{user.name}</div>
      </div>
      <div className="mb-4">
        <div className="font-semibold text-gray-700">Email:</div>
        <div className="text-gray-900">{user.email}</div>
      </div>
      <div className="mt-6">
        <span className="text-gray-500 text-sm">More profile features coming soon...</span>
      </div>
    </div>
  );
};

export default AccountDashboard;
