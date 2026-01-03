import SimpleAuthScreen from '../components/features/profile/SimpleAuthScreen';
import ProfileView from '../components/features/profile/ProfileView';
import { useSimpleAuth } from '../context/SimpleAuthContext';

const Profile = () => {
  const { user } = useSimpleAuth();
  return user ? <ProfileView /> : <SimpleAuthScreen />;
};

export default Profile;
