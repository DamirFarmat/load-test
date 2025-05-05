import React, {useContext, useState, useEffect} from 'react';
import {Context} from "../index";
import {observer} from "mobx-react-lite";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { changePassword, getAllUsers, changeUserRole, deleteUser, createUser } from '../http/userAPI';
import { toast } from 'react-toastify';
import { statusServer } from '../http/serverAPI';

const Admin = observer(() => {
    const {user} = useContext(Context);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        role: 'USER'
    });
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [statuses, setStatuses] = useState({});
    const [servers, setServers] = useState({ servers: [] });

    useEffect(() => {
        getAllUsers().then(setUsers).catch(() => {
            toast.error('Ошибка загрузки пользователей');
        }).finally(() => setUsersLoading(false));
    }, []);

    useEffect(() => {
        let timeout;

        if (!servers.servers.length) {
            setStatuses({});
            return;
        }

        const fetchStatuses = async () => {
            try {
                const statusData = await statusServer();
                const statusMap = statusData.reduce((acc, server) => {
                    acc[server.ip] = server;
                    return acc;
                }, {});
                setStatuses(statusMap);
                timeout = setTimeout(fetchStatuses, 5000);
            } catch (error) {
                console.error("Ошибка загрузки статусов серверов:", error);
                timeout = setTimeout(fetchStatuses, 5000);
            }
        };
        fetchStatuses();

        return () => clearTimeout(timeout);
    }, [servers.servers.length]);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !repeatPassword) {
            toast.error('Заполните все поля');
            return;
        }
        if (newPassword !== repeatPassword) {
            toast.error('Новые пароли не совпадают');
            return;
        }
        if (oldPassword === newPassword) {
            toast.error('Новый пароль должен отличаться от старого');
            return;
        }
        setLoading(true);
        try {
            const res = await changePassword(oldPassword, newPassword);
            toast.success('Пароль изменен', {autoClose: 3000, style: {background: '#d4edda', color: '#155724'}});
            setShowPasswordForm(false);
            setOldPassword('');
            setNewPassword('');
            setRepeatPassword('');
        } catch (e) {
            if (!e.response?.data?.message) {
                toast.error('Ошибка при смене пароля');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await changeUserRole(id, newRole);
            setUsers(users => users.map(u => u.id === id ? { ...u, role: newRole } : u));
            toast.success('Роль пользователя изменена', {autoClose: 3000, style: {background: '#d4edda', color: '#155724'}});
        } catch (e) {
            if (!e.response?.data?.message) {
                toast.error('Ошибка при смене роли');
            }
        }
    };

    const handleDeleteUser = async (id, email) => {
        if (!window.confirm(`Удалить пользователя ${email}?`)) return;
        try {
            await deleteUser(id);
            setUsers(users => users.filter(u => u.id !== id));
            toast.success('Пользователь удалён', {autoClose: 3000, style: {background: '#d4edda', color: '#155724'}});
        } catch (e) {
            if (!e.response?.data?.message) {
                toast.error('Ошибка при удалении пользователя');
            }
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password) {
            toast.error('Заполните все поля');
            return;
        }
        setLoading(true);
        try {
            const res = await createUser(newUser);
            setUsers([...users, res.user]);
            setShowCreateUserModal(false);
            setNewUser({ email: '', password: '', role: 'USER' });
            toast.success('Пользователь создан', {autoClose: 3000, style: {background: '#d4edda', color: '#155724'}});
        } catch (e) {
            if (e.response?.data?.message) {
                toast.error(e.response.data.message);
            } else {
                toast.error('Ошибка при создании пользователя');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid>
            <Card className="p-3 mb-4">
                <h3>Мой профиль</h3>
                <p><strong>Email:</strong> {user.user.email}</p>
                <p><strong>Роль:</strong> {user.user.role}</p>
                <Button 
                    variant="outline-primary"  
                    className="align-self-start mt-2" 
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                    {showPasswordForm ? 'Отмена' : 'Изменить пароль'}
                </Button>
                {showPasswordForm && (
                    <Form className="mt-3" style={{maxWidth: 400}}>
                        <Form.Group className="mb-2">
                            <Form.Label>Старый пароль</Form.Label>
                            <Form.Control type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} disabled={loading} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Новый пароль</Form.Label>
                            <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={loading} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Повторите новый пароль</Form.Label>
                            <Form.Control type="password" value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} disabled={loading} />
                        </Form.Group>
                        <Button variant="success" className="mt-2" onClick={handleChangePassword} disabled={loading}>
                            {loading ? 'Сохраняем...' : 'Сохранить'}
                        </Button>
                    </Form>
                )}
            </Card>
            <h4>Пользователи системы</h4>
            <Button 
                variant="outline-secondary" 
                size="sm" 
                className="mb-3" 
                onClick={() => setShowCreateUserModal(true)}
            >
                + Создать пользователя
            </Button>
            {usersLoading ? (
                <div>Загрузка пользователей...</div>
            ) : (
                <div className="row g-3 align-items-stretch">
                    {users.map(u => (
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 position-relative" key={u.id}>
                            {u.id !== user.user.id && (
                                <Button 
                                variant="outline-dark" 
                                    size="sm" 
                                    className="position-absolute top-0 end-1 m-1" 
                                    style={{zIndex:2, borderRadius: 6, width: 28, height: 28, padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', right: 8}} 
                                    onClick={() => handleDeleteUser(u.id, u.email)}
                                    title="Удалить пользователя"
                                >
                                    ×
                                </Button>
                            )}
                            <Card className="p-2" style={{minWidth: 220, maxWidth: 300}}>
                                <div><strong>Email:</strong> {u.email}</div>
                                <div><strong>Роль: </strong> 
                                    <Form.Select 
                                        size="sm" 
                                        value={u.role} 
                                        onChange={e => handleRoleChange(u.id, e.target.value)}
                                        disabled={u.id === user.user.id}
                                        style={{width: 100, display: 'inline-block'}}
                                    >
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </Form.Select>
                                    {u.id === user.user.id && <span style={{fontSize: 12, color: '#888', marginLeft: 4}}>(вы)</span>}
                                </div>
                                <div><strong>ID:</strong> {u.id}</div>
                            </Card>
                        </div>
                    ))}
                </div>
            )}

            <Modal show={showCreateUserModal} onHide={() => setShowCreateUserModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Создание нового пользователя</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={newUser.email}
                                onChange={e => setNewUser({...newUser, email: e.target.value})}
                                disabled={loading}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control
                                type="password"
                                value={newUser.password}
                                onChange={e => setNewUser({...newUser, password: e.target.value})}
                                disabled={loading}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Роль</Form.Label>
                            <Form.Select
                                value={newUser.role}
                                onChange={e => setNewUser({...newUser, role: e.target.value})}
                                disabled={loading}
                            >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateUserModal(false)} disabled={loading}>
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleCreateUser} disabled={loading}>
                        {loading ? 'Создание...' : 'Создать'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
});

export default Admin; 