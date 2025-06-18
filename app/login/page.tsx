"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Si ya está autenticado, redirige al dashboard
    if (typeof window !== "undefined" && localStorage.getItem("isAuthenticated") === "true") {
      router.push("/");
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Autenticación simulada
    if (email === "alan@alan.com" && password === "1234") {
      localStorage.setItem("isAuthenticated", "true");
      router.push("/"); // Redirige al dashboard
    } else {
      alert("Credenciales incorrectas");
    }
  };

  // 👇 Aquí agregas el useEffect
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
        delay = 1500; // Espera antes de borrar
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
      <img src="/logo.png" alt="NitroDrive Logo" className="login-logo" />
      <div className="login-content">
        <form className="login-form" onSubmit={handleLogin}>
          <h2><span className="typewriter-text"></span></h2>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;