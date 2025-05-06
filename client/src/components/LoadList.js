import React, { useContext, useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { deleteLoad, fetchLoad } from "../http/loadAPI";
import { Card, Button, Row, Col, Dropdown } from "react-bootstrap";
import EditLoad from "./models/EditLoad";
import './LoadList.css';

const LoadList = observer(() => {
    const { load } = useContext(Context);
    const [editModalShow, setEditModalShow] = useState(false);
    const [editLoadItem, setEditLoadItem] = useState(null);

    useEffect(() => {
        fetchLoad().then(data => load.setLoads(data));
    }, []);

    const delLoad = async (name) => {
        const confirmed = window.confirm("Вы уверены, что хотите удалить этот шаблон?");
        if (!confirmed) return;

        try {
            await deleteLoad({ name });
            fetchLoad().then(data => load.setLoads(data));
        } catch (error) {
            console.error('Ошибка при удалении шаблона:', error);
        }
    };

    const handleEdit = (item) => {
        setEditLoadItem(item);
        setEditModalShow(true);
    };

    const handleEditSuccess = () => {
        fetchLoad().then(data => load.setLoads(data));
    };

    return (
        <Row className="w-100 m-0">
            {load.loads.map((loadItem) => (
                <Col key={loadItem.id} md={3} className="mb-3">
                    <Card className="p-3 shadow-sm text-center position-relative">
                        <Dropdown className="position-absolute top-0 end-0 m-2">
                            <Dropdown.Toggle className="no-caret" variant="outline-secondary" style={{ border: "none" }}>
                                <span style={{ fontSize: "1.2rem" }}>⋮</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end">
                                <Dropdown.Item onClick={() => handleEdit(loadItem)}>
                                    Редактировать
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => delLoad(loadItem.name)} className="text-danger">
                                    Удалить
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Card.Body>
                            <Card.Title className="fw-bold">{loadItem.name}</Card.Title>
                            <Card.Text className="text-muted">{loadItem.bash}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
            <EditLoad
                show={editModalShow}
                onHide={() => setEditModalShow(false)}
                loadItem={editLoadItem}
                onEdit={handleEditSuccess}
            />
        </Row>
    );
});

export default LoadList;
