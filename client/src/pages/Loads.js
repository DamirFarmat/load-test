import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import {Button, Row, Col} from "react-bootstrap";
import {observer} from "mobx-react-lite";
import CreateLoad from "../components/models/CreateLoad";
import LoadList from "../components/LoadList";


const Loads = observer(() => {
    const [loadVisible, setLoadVisible] = useState(false);

    return (
        <Container fluid>
            <div style={{ maxWidth: 340, marginLeft: 0 }}>
                <Button
                    variant="dark"
                    className="mb-3"
                    onClick={() => setLoadVisible(true)}
                >
                    Добавить шаблон тестирования
                </Button>
            </div>
            <div style={{ marginLeft: -12 }}>
                <LoadList />
            </div>
            <CreateLoad show={loadVisible} onHide={() => setLoadVisible(false)} />
        </Container>
    );
});

export default Loads;