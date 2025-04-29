import React, { useContext, useEffect } from 'react';
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { deleteLoad, fetchLoad } from "../http/loadAPI";
import { Card, Button, Row, Col } from "react-bootstrap";

const LoadList = observer(() => {
    const { load } = useContext(Context);

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

    return (
        <div className="m-2"><Row>
            {load.loads.map((loadItem) => (
                <Col key={loadItem.id} md={3} className="mb-3">
                    <Card className="p-3 shadow-sm text-center position-relative">
                        <Button
                            variant="outline-dark"
                            className="position-absolute top-0 end-0 m-2"
                            onClick={() => delLoad(loadItem.name)}
                        >
                            ×
                        </Button>
                        <Card.Body>
                            <Card.Title className="fw-bold">{loadItem.name}</Card.Title>
                            <Card.Text className="text-muted">{loadItem.bash}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row></div>

    );
});

export default LoadList;
