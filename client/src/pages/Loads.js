import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import {Button, Row} from "react-bootstrap";
import {observer} from "mobx-react-lite";
import CreateLoad from "../components/models/CreateLoad";
import LoadList from "../components/LoadList";


const Loads = observer(() => {
    const [loadVisible, setLoadVisible] = useState(false);

    return (
        <Container fluid className="pe-3" style={{ marginTop: '76px', paddingLeft: '210px' }}>
            <Button variant="dark" className="mt-2 ms-2 d-flex align-items-center" onClick={() => setLoadVisible(true)}>
                Добавить шаблон тестирования
            </Button>
            <Row className="w-100">
                <LoadList />
            </Row>
            <CreateLoad show={loadVisible} onHide={() => setLoadVisible(false)} />
        </Container>

    );
});

export default Loads;