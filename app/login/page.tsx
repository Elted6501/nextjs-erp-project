"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Redirect if JWT cookie exists (basic check; ideally should validate the token on server)
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
        console.log('Received JWT:', token); // 👉 Debug: print JWT in console
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

  // Text typing animation
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
      <Image src="/logo4k.png" alt="NitroDrive Logo" className="login-logo" width={1228} height={772}/>
      <div className="login-content">
        <form className="login-form" onSubmit={handleLogin}>
          <h2><span className="typewriter-text"></span></h2>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
