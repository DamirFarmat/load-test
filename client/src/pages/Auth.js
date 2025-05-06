import React, { useContext, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { Button, Card, Form, Stack } from 'react-bootstrap';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE, REGISTRATION_ROUTE } from '../utils/consts';
import { registration, login } from '../http/userAPI';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';

const Auth = observer(() => {
  const { user } = useContext(Context);
  const location = useLocation();
  const isLogin = location.pathname === LOGIN_ROUTE;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const click = async (event) => {
    event.preventDefault();
    try {
      let data;
      if (isLogin) {
        data = await login(email, password);
      } else {
        data = await registration(email, password);
      }
      user.setUser(data);
      user.setIsAuth(true);
      navigate('/servers');
    } catch (e) {
      alert(e.response.data.message);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ height: '100vh' }}
    >
      <Card style={{ width: 400, padding: '2rem', borderRadius: '15px' }}>
        <h2 className="text-center mb-4">{isLogin ? 'Авторизация' : 'Регистрация'}</h2>
        <Form>
          <Form.Group controlId="formEmail" className="mb-4">
            <Form.Control
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-0 border-top-0 border-start-0 border-end-0"
              style={{ borderBottom: '2px solid #dee2e6', boxShadow: 'none' }}
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mb-4">
            <Form.Control
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-0 border-top-0 border-start-0 border-end-0"
              style={{ borderBottom: '2px solid #dee2e6', boxShadow: 'none' }}
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 mb-4 rounded-3 py-2"
            onClick={click}
            style={{ fontWeight: 500 }}
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </Button>

          <Stack gap={2} className="mb-4">
            <Button 
              variant="outline-dark" 
              className="d-flex align-items-center justify-content-center gap-2"
              href="https://github.com/DamirFarmat/load-test"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
              </svg>
              GitHub
            </Button>
          </Stack>

          <div className="text-center mt-3">
            {isLogin ? (
              <>
                Нет аккаунта? {' '}
                <NavLink to={REGISTRATION_ROUTE} className="text-decoration-none">
                  Регистрация
                </NavLink>
              </>
            ) : (
              <>
                Есть аккаунт? {' '}
                <NavLink to={LOGIN_ROUTE} className="text-decoration-none">
                  Войти
                </NavLink>
              </>
            )}
          </div>
        </Form>
      </Card>
    </Container>
  );
});

export default Auth;