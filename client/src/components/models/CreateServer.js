import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {Form} from "react-bootstrap";
import {createServer} from "../../http/serverAPI";


const CreateServer = ({show, onHide}) => {

    const [IP, setIP] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({
        ip: false,
        login: false,
        password: false,
    });

    const addServer = () => {

        const validationErrors = {
            ip: IP.trim() === '',
            login: login.trim() === '',
            password: password.trim() === '',
        };

        setErrors(validationErrors);
        if (Object.values(validationErrors).includes(true)) return;

        createServer({ip: IP, login: login, password: password}).then(data => {
            setIP('')
            setLogin('')
            setPassword('')
            setErrors({ ip: false, login: false, password: false});
            onHide()
            window.location.reload()
        }).catch(() => {});
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Добавить новый сервер
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Control
                            value={IP}
                            onChange={e => setIP(e.target.value)}
                            placeholder="IP"
                            style={{ borderColor: errors.ip ? 'red' : '' }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control
                            value={login}
                            onChange={e => setLogin(e.target.value)}
                            placeholder="Login"
                            style={{ borderColor: errors.login ? 'red' : '' }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            type="password"
                            style={{ borderColor: errors.password ? 'red' : '' }}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>Закрыть</Button>
                <Button variant="outline-success" onClick={addServer}>Добавить</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateServer;