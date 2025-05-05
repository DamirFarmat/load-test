import React, {useContext, useState} from 'react';
import {Context} from "../index";
import {observer} from "mobx-react-lite";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { changePassword } from '../http/userAPI';
import { toast } from 'react-toastify';

const MyProfile = observer(() => {
    const {user} = useContext(Context);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [loading, setLoading] = useState(false);

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

    return (
        <Container fluid>
            <Card className="p-3">
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
        </Container>
    );
});

export default MyProfile; 