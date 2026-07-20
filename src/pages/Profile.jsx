import SimpleAuthScreen from '../components/features/profile/SimpleAuthScreen';
import ProfileView from '../components/features/profile/ProfileView';
import SEO from '../components/seo/SEO';
import { useSimpleAuth } from '../context/SimpleAuthContext';

const Profile = () => {
  const { user } = useSimpleAuth();
  return (
    <>
      <SEO
        title="Личный кабинет"
        description="Профиль Arbarea: скидка 10% для зарегистрированных, история заказов и избранное."
        url="/profile"
        noindex
      />
      {user ? <ProfileView /> : <SimpleAuthScreen />}
    </>
  );
};

export default Profile;
