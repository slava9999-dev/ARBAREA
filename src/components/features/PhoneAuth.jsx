import { useState, useEffect, useRef } from 'react';
import { auth } from '../../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import Input from '../ui/Input';
import Button from '../ui/Button';

/**
 * Phone authentication component using Firebase Auth.
 * Steps: 1) Render invisible reCAPTCHA, 2) Send SMS, 3) Verify code.
 */
const PhoneAuth = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('enterPhone'); // 'enterPhone' | 'enterCode' | 'signedIn'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const confirmationResultRef = useRef(null);

  // Initialize invisible reCAPTCHA once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved, allow send SMS
          },
          'expired-callback': () => {
            // Reset verifier if needed
          },
        },
      );
      // Render the widget (required even for invisible mode)
      window.recaptchaVerifier.render().catch(console.error);
    }
  }, []);

  const sendCode = async () => {
    setError('');
    if (!phone) {
      setError('Введите номер телефона');
      return;
    }
    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier,
      );
      confirmationResultRef.current = confirmationResult;
      setStep('enterCode');
    } catch (e) {
      console.error(e);
      setError('Не удалось отправить код. Проверьте номер и попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError('');
    if (!code) {
      setError('Введите код из SMS');
      return;
    }
    setLoading(true);
    try {
      const _result = await confirmationResultRef.current.confirm(code);
      setStep('signedIn');
    } catch (e) {
      console.error(e);
      setError('Неверный код. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div id="recaptcha-container" />
      {step === 'enterPhone' && (
        <>
          <h2 className="text-xl font-bold mb-4">Вход по телефону</h2>
          {error && (
            <div className="p-2 bg-red-100 text-red-800 rounded mb-2">
              {error}
            </div>
          )}
          <Input
            type="tel"
            placeholder="+7XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mb-4"
          />
          <Button onClick={sendCode} isLoading={loading} className="w-full">
            Отправить код
          </Button>
        </>
      )}
      {step === 'enterCode' && (
        <>
          <h2 className="text-xl font-bold mb-4">Введите код из SMS</h2>
          {error && (
            <div className="p-2 bg-red-100 text-red-800 rounded mb-2">
              {error}
            </div>
          )}
          <Input
            placeholder="Код из SMS"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mb-4"
          />
          <Button onClick={verifyCode} isLoading={loading} className="w-full">
            Подтвердить
          </Button>
        </>
      )}
      {step === 'signedIn' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Вы успешно вошли!
          </h2>
        </div>
      )}
    </div>
  );
};

export default PhoneAuth;
