import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import api from '../api/axios';

const Ctx = createContext(null);

const init = () => {
  try {
    const token = localStorage.getItem('dt_token');
    const user  = localStorage.getItem('dt_user');
    return { token, user: user ? JSON.parse(user) : null, loading: !!token };
  } catch {
    return { token: null, user: null, loading: false };
  }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET':   return { token: action.token, user: action.user, loading: false };
    case 'CLEAR': return { token: null, user: null, loading: false };
    default:      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, init);

  // On mount, re-validate stored token with the server
  useEffect(() => {
    if (!state.token) return;
    api.get('/api/auth/me')
      .then((r) => {
        const user = r.data.user ?? r.data;
        dispatch({ type: 'SET', token: state.token, user });
        localStorage.setItem('dt_user', JSON.stringify(user));
      })
      .catch(() => {
        localStorage.removeItem('dt_token');
        localStorage.removeItem('dt_user');
        dispatch({ type: 'CLEAR' });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((token, user) => {
    localStorage.setItem('dt_token', token);
    localStorage.setItem('dt_user', JSON.stringify(user));
    dispatch({ type: 'SET', token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dt_token');
    localStorage.removeItem('dt_user');
    dispatch({ type: 'CLEAR' });
  }, []);

  const updateUser = useCallback((patch) => {
    const updated = { ...state.user, ...patch };
    localStorage.setItem('dt_user', JSON.stringify(updated));
    dispatch({ type: 'SET', token: state.token, user: updated });
  }, [state]);

  return (
    <Ctx.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
