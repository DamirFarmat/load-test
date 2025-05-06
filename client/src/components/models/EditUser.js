import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { editUser } from '../../http/userAPI';
import { toast } from 'react-toastify';

const EditUser = ({ show, onHide, user }) => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [step, setStep] = useState(1); // 1: редактирование, 2: подтверждение
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setEmail(user.email || '');
            setNewPassword(user.password || '');
        } else {
            setEmail('');
            setNewPassword('');
        }
        setAdminPassword('');
        setStep(1);
        setLoading(false);
    }, [user, show]);

    if (!user) return null;

    const handleEditClick = () => {
        setStep(2);
    };

    const handleConfirm = async () => {
        if (!adminPassword) {
            toast.error('Введите ваш пароль для подтверждения');
            return;
        }
        setLoading(true);
        try {
            const res = await editUser({
                userId: user.id,
                newEmail: email !== user.email ? email : undefined,
                newPassword: newPassword && newPassword !== user.password ? newPassword : undefined,
                adminPassword
            });
            toast.success(res.message || 'Пользователь успешно изменён');
            onHide();
        } catch (e) {
            if (e.response?.data?.message) {
                toast.error(e.response.data.message);
            } else {
                toast.error('Ошибка при изменении');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Редактировать пользователя</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={loading || step === 2}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Новый пароль</Form.Label>
                        <Form.Control
                            type="text"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            disabled={loading || step === 2}
                        />
                    </Form.Group>
                    {step === 1 && (
                        <div className="d-flex justify-content-end">
                            <Button
                                variant="success"
                                onClick={handleEditClick}
                                disabled={loading}
                            >
                                Редактировать
                            </Button>
                        </div>
                    )}
                    {step === 2 && (
                        <>
                            <Form.Group className="mb-3 mt-3">
                                <Form.Label>Ваш пароль для подтверждения</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={adminPassword}
                                    onChange={e => setAdminPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </Form.Group>
                            <div className="d-flex justify-content-end">
                                <Button
                                    variant="success"
                                    onClick={handleConfirm}
                                    disabled={loading}
                                >
                                    Подтвердить
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditUser; 