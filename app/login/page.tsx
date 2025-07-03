"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './login.css';

// Login component for user authentication
function Login() {
  // State for username (email) input
  const [username, setUsername] = useState('');
  // State for password input
  const [password, setPassword] = useState('');
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  // Next.js router for navigation
  const router = useRouter();
  // State for button animation
  const [animationType, setAnimationType] = useState<'' | 'glow'>('');

  // Redirect to home if already logged in (token exists)
  useEffect(() => {
    if (document.cookie.includes('token=')) {
      router.push('/');
    }
  }, [router]);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send login request to API
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.mustChangePassword) {
        // Redirect to change password page if required
        router.push(`/change-password?userId=${data.userId}`);
        return;
      }

      if (res.ok) {
        // On successful login, redirect to home
        const { token } = data;
        console.log('Received JWT:', token);
        router.push('/');
      } else {
        // Show error message
        alert(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server');
    }
  };

  // Typewriter effect for welcome messages
  useEffect(() => {
    const texts = ['Welcome', 'Bienvenido', 'Bienvenue', 'Bem-vindo', '欢迎'];
    const typingElement = document.querySelector('.typewriter-text');
    let index = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      const currentText = texts[index];
      if (!typingElement) return;

      if (isDeleting) {
        charIndex--;
        typingElement.textContent = currentText.substring(0, charIndex);
      } else {
        charIndex++;
        typingElement.textContent = currentText.substring(0, charIndex);
      }

      let delay = isDeleting ? 50 : 120;

      if (!isDeleting && charIndex === currentText.length) {
        delay = 1500;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        index = (index + 1) % texts.length;
        delay = 500;
      }

      setTimeout(type, delay);
    };

    type();
  }, []);

  // Render login form
  return (
    <div className="login-container">
      <Image src="/logo4k.png" alt="NitroDrive Logo" className="login-logo" width={1228} height={772} />
      <div className="login-content">
        <form className="login-form" onSubmit={handleLogin}>
          <h2><span className="typewriter-text"></span></h2>

          <input
            type="text"
            placeholder="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Image
              src={showPassword ? '/eye-open.png' : '/eye-closed.png'}
              alt="Toggle password visibility"
              width={20}
              height={20}
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

            <button
              type="submit"
              className={`login-button ${animationType === 'glow' ? 'glow' : ''}`}
              onClick={() => setAnimationType('glow')}
            >
              Login
            </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
