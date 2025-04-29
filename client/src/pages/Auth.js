import React, {useContext, useState} from 'react';
import Container from "react-bootstrap/Container";
import {Button, Card, Form} from "react-bootstrap";
import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import {LOGIN_ROUTE, REGISTRATION_ROUTE} from "../utils/consts";
import {registration, login} from "../http/userAPI";
import {observer} from "mobx-react-lite";
import {Context} from "../index";

const Auth = observer( () => {
    const {user} = useContext(Context);
    const location = useLocation();
    const isLogin = location.pathname === LOGIN_ROUTE;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const click = async (event) => {
        event.preventDefault();
        try {
            let data

            if (isLogin) {
                data = await login(email, password)
            } else {
                data = await registration(email, password);
            }
            user.setUser(data);
            user.setIsAuth(true)
            navigate('/servers')
        } catch (e) {
            alert(e.response.data.message);
        }


    }

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: window.innerHeight - 54 }}>
            <Card style={{ width: 400, padding: '2rem' }}>
                <h2 className="text-center">{isLogin ? 'Авторизация' : 'Регистрация'}</h2>
                <Form>
                    <Form.Group controlId="formLogin">
                        <Form.Label>Логин</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите логин"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formPassword" className="mt-3">
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100 mt-4" onClick={click}>
                        {isLogin ? 'Войти' : 'Зарегистрироваться' }
                    </Button>
                    {isLogin ?
                        <div className="text-center mt-3">
                            Нет аккаунта? <NavLink to={REGISTRATION_ROUTE}>Регистрация</NavLink>
                        </div>
                        :
                        <div className="text-center mt-3">
                            Есть аккаунта? <NavLink to={LOGIN_ROUTE}>Войти</NavLink>
                        </div>
                    }
                </Form>
            </Card>
        </Container>
    );
});

export default Auth;