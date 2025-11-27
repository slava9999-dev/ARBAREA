import { useAuth } from '../context/AuthContext';
import ProfileView from '../components/features/profile/ProfileView';
import AuthScreen from '../components/features/profile/AuthScreen';

const Profile = ({ setActiveTab }) => {
  const { user } = useAuth();
  return user ? <ProfileView setActiveTab={setActiveTab} /> : <AuthScreen />;
};

export default Profile;
