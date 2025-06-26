"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [animationType, setAnimationType] = useState<'' | 'glow' >('');
  

  useEffect(() => {
    if (document.cookie.includes('token=')) {
      router.push('/');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const { token } = await res.json();
        console.log('Received JWT:', token);
        router.push('/');
      } else {
        const { error } = await res.json();
        alert(error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server');
    }
  };

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

  return (
    <div className="login-container">
      <Image src="/logo4k.png" alt="NitroDrive Logo" className="login-logo" width={1228} height={772} />
      <div className="login-content">
        <form className="login-form" onSubmit={handleLogin}>
          <h2><span className="typewriter-text"></span></h2>

          <input
            type="text"
            placeholder="username"
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
