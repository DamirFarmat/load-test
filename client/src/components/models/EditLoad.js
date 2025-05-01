import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Form } from "react-bootstrap";
import { editLoad } from "../../http/loadAPI";

const EditLoad = ({ show, onHide, loadItem, onEdit }) => {
    const [Name, setName] = useState('');
    const [Bash, setBash] = useState('');
    const [Type, setType] = useState('L4');
    const [error, setError] = useState({
        name: false,
        bash: false,
        type: false
    });

    useEffect(() => {
        if (loadItem) {
            setName(loadItem.name || '');
            setBash(loadItem.bash || '');
            setType(loadItem.type || 'L4');
        }
    }, [loadItem]);

    const handleEdit = () => {
        const validationErrors = {
            name: Name.trim() === '',
            bash: !Bash.includes("{{target}}"),
            type: !["L4", "L7"].includes(Type)
        };
        setError(validationErrors);
        if (Object.values(validationErrors).includes(true)) return;
        editLoad({ id: loadItem.id, name: Name, bash: Bash, type: Type }).then(() => {
            onEdit && onEdit();
            onHide();
        }).catch(() => {});
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Редактировать шаблон</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Label>Название шаблона</Form.Label>
                    <Form.Group className="mb-3">
                        <Form.Control
                            value={Name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Name"
                            style={{ borderColor: error.name ? "red" : "" }}
                        />
                    </Form.Group>
                    <Form.Label>Используйте <span style={{ color: "red" }}>{"{{target}} {{port}}"}</span> как ключи.</Form.Label>
                    <Form.Group className="mb-3">
                        <Form.Control
                            value={Bash}
                            onChange={e => setBash(e.target.value)}
                            placeholder="Bash"
                            style={{ borderColor: error.bash ? "red" : "" }}
                        />
                        {error.bash && (
                            <div style={{ color: "red", marginTop: "5px" }}>
                                Добавьте {"{{target}}"} в команду Bash.
                            </div>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Уровень тестирования</Form.Label>
                        <Form.Select value={Type} onChange={e => setType(e.target.value)} style={{ borderColor: error.type ? "red" : "" }}>
                            <option value="L4">L4</option>
                            <option value="L7">L7</option>
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>Закрыть</Button>
                <Button variant="outline-success" onClick={handleEdit}>Сохранить</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditLoad; 