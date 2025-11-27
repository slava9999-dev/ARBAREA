import { useAuth } from '../context/AuthContext';
import ProfileView from '../components/features/profile/ProfileView';
import AuthScreen from '../components/features/profile/AuthScreen';

const Profile = () => {
  const { user } = useAuth();
  return user ? <ProfileView /> : <AuthScreen />;
};

export default Profile;
