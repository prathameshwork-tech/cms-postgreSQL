import React from 'react';
import ChangePassword from '../../components/users/ChangePassword';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Account = () => {
  const { user } = useAuth();
  const handlePasswordChange = async ({ currentPassword, newPassword }) => {
    // Call backend API to change password
    await authAPI.changePassword({ currentPassword, newPassword });
  };

  return (
    <div style={{ padding: 32 }}>
      <ChangePassword userEmail={user?.email || ''} onPasswordChange={handlePasswordChange} />
    </div>
  );
};

export default Account; 