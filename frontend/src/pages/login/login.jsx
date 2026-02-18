import { useState } from 'react';
import { authenticate } from '../../services/api';
import './login.css';

function Login({ onAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await authenticate({
        name: username,
        password,
      });

      setMessage('Login enviado com sucesso.');
      if (onAuthenticated) {
        onAuthenticated();
      }
    } catch (error) {
      setMessage('Erro ao enviar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Login</h1>

        <input
          type="text"
          placeholder="User"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'login'}
        </button>

        {message && <p className="login-message">{message}</p>}
      </form>
    </div>
  );
}

export default Login;
