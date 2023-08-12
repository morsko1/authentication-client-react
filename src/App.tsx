import { GoogleLogin } from '@react-oauth/google';
import './App.css';
import useAuth from './useAuth';

function App() {
  const {
    user,
    onGoogleLoginSuccess,
    onGoogleLoginFailure,
    logout,
    loading
  } = useAuth();

  return (
    <div className="App">
      <h3>Google Auth</h3>

      {loading && <div>loading...</div>}

      {!user && !loading && (
        <GoogleLogin
          size="medium"
          type="standard"
          onSuccess={onGoogleLoginSuccess}
          onError={onGoogleLoginFailure}
        />
      )}

      {user && !loading && (
        <div>
          <pre>{JSON.stringify(user)}</pre>
          <br />
          <button onClick={logout}>logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
