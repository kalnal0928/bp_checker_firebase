import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

const Login = ({ user, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setUser(auth.currentUser);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setUser(auth.currentUser);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleSignUp}>Sign Up</button>
          {error && <p>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Login;
