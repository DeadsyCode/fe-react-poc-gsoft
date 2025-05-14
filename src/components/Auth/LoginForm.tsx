import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { FiUser, FiLock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft } from 'react-icons/bs';
import './LoginForm.css';
import geniuslogo from '../../assets/genius-soft-logo.png';

interface CarouselContent {
  type: 'video' | 'image';
  source: string;
  poster?: string;
  translationKey: string;
  duration: number; // Duration in milliseconds
}

// Sample carousel content - replace with your actual videos
const carouselContent: CarouselContent[] = [
  {
    type: 'video',
    source: './src/assets/genius-all.mp4',
    poster: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    translationKey: 'slide1',
    duration: 10000 // 10 seconds
  },
  {
    type: 'video',
    source: './src/assets/work-collab.mp4',
    poster: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    translationKey: 'slide2',
    duration: 3000 // 5 seconds
  },
  {
    type: 'video',
    source: './src/assets/working-pc.mp4',
    poster: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    translationKey: 'slide3',
    duration: 5000 // 5 seconds
  }
];

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel with dynamic timing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselContent.length - 1 ? 0 : prev + 1));
    }, carouselContent[currentSlide].duration);

    return () => clearInterval(interval);
  }, [currentSlide]); // Re-run when currentSlide changes to update the interval

  // Handle video play/pause on slide change
  useEffect(() => {
    const videos = document.querySelectorAll('.carousel-video');
    videos.forEach((video, index) => {
      const videoElement = video as HTMLVideoElement;
      if (index === currentSlide) {
        videoElement.play().catch(error => {
          console.log('Video autoplay failed:', error);
        });
      } else {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    });
  }, [currentSlide]);

  // Handle video ended event
  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.currentTime = 0;
    video.play().catch(error => {
      console.log('Video replay failed:', error);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { token, userInfo } = await login(formData.email, formData.password);
      authLogin(token, userInfo);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google login here
    console.log('Google login clicked');
    // Mock successful login for demonstration
    const mockUserInfo = {
      firstName: 'Google',
      lastName: 'User',
      email: 'google.user@example.com'
    };
    const mockToken = 'google-mock-token';
    authLogin(mockToken, mockUserInfo);
    navigate('/');
  };

  const handleMicrosoftLogin = () => {
    // Implement Microsoft login here
    console.log('Microsoft login clicked');
    // Mock successful login for demonstration
    const mockUserInfo = {
      firstName: 'Microsoft',
      lastName: 'User',
      email: 'microsoft.user@example.com'
    };
    const mockToken = 'microsoft-mock-token';
    authLogin(mockToken, mockUserInfo);
    navigate('/');
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselContent.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselContent.length - 1 : prev - 1));
  };

  return (
    <div className="modern-login-container">
      <div className="login-layout">
        {/* Left Panel - Login Form */}
        <div className="login-form-panel">
          <div className="login-form-content">
            <div className="logo-container">
              <img src={geniuslogo} alt="Genius Soft Logo" className="login-logo" />
            </div>

            <h1 className="login-title">{t('auth.login')}</h1>
            <p className="login-subtitle">{t('auth.loginSubtitle')}</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">


                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('auth.email')}
                    required
                  />

              </div>

              <div className="form-group">

                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('auth.password')}
                    required
                  />

                <div className="forgot-password">
                  <a href="#">{t('auth.forgotPassword')}</a>
                </div>
              </div>

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? t('auth.signingIn') : t('auth.submit')}
              </button>
            </form>

            <div className="divider">
              <span>{t('auth.or')}</span>
            </div>
            <div className="social-login-options">
              <button
                className="social-login-button google-button"
                onClick={handleGoogleLogin}
              >
                <FcGoogle className="social-icon" />
                <span>{t('auth.continueWithGoogle')}</span>
              </button>

              <button
                className="social-login-button microsoft-button"
                onClick={handleMicrosoftLogin}
              >
                <BsMicrosoft className="social-icon" />
                <span>{t('auth.continueWithMicrosoft')}</span>
              </button>
            </div>


            <p className="signup-text">
              {t('auth.noAccount')} <a href="#">{t('auth.signUp')}</a>
            </p>
          </div>
        </div>

        {/* Right Panel - Carousel */}
        <div className="carousel-panel">
          <div className="carousel-container">
            {carouselContent.map((slide, index) => (
              <div
                key={index}
                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="carousel-media">
                  {slide.type === 'video' ? (
                    <video
                      className="carousel-video"
                      src={slide.source}
                      poster={slide.poster}
                      muted
                      loop
                      playsInline
                      onEnded={handleVideoEnded}
                      preload="auto"
                    />
                  ) : (
                    <div
                      className="carousel-image"
                      style={{ backgroundImage: `url(${slide.source})` }}
                    />
                  )}
                  <div className="carousel-overlay"></div>
                  <div className="carousel-content">
                    <h2>{t(`auth.carousel.${slide.translationKey}.title`)}</h2>
                    <p>{t(`auth.carousel.${slide.translationKey}.description`)}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="carousel-controls">
              {carouselContent.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
