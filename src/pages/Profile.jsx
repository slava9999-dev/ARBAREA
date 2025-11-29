import AuthScreen from '../components/features/profile/AuthScreen';
import ProfileView from '../components/features/profile/ProfileView';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  return user ? <ProfileView /> : <AuthScreen />;
};

export default Profile;
