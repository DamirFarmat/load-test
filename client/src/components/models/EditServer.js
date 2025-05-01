import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { updateServer } from "../../http/serverAPI";

const EditServer = ({ show, onHide, server }) => {
    const [ip, setIp] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        if (server) {
            setIp(server.ip || '');
            setLogin(server.login || '');
            setPassword(server.password || '');
        }
    }, [server]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        try {
            await updateServer({
                id: server.id,
                ip,
                login,
                password
            });
            onHide();
            window.location.reload();
        } catch (e) {
            console.error('Ошибка при обновлении сервера:', e);
            alert(e.response?.data?.message || 'Произошла ошибка при обновлении сервера');
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Редактировать сервер</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>IP адрес</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            value={ip}
                            onChange={e => setIp(e.target.value)}
                            placeholder="Введите IP адрес"
                        />
                        <Form.Control.Feedback type="invalid">
                            Пожалуйста, введите IP адрес
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Логин</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            value={login}
                            onChange={e => setLogin(e.target.value)}
                            placeholder="Введите логин"
                        />
                        <Form.Control.Feedback type="invalid">
                            Пожалуйста, введите логин
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            required
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                        />
                        <Form.Control.Feedback type="invalid">
                            Пожалуйста, введите пароль
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" className="me-2" onClick={onHide}>
                            Закрыть
                        </Button>
                        <Button variant="primary" type="submit">
                            Сохранить
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditServer; 