import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import {Button, Row} from "react-bootstrap";
import ServerList from "../components/ServerList";
import CreateServer from "../components/models/CreateServer";
import {observer} from "mobx-react-lite";

const Servers = observer(() => {
    const [serverVisible, setServerVisible] = useState(false);

    return (
        <Container fluid className="pe-3" style={{ marginTop: '76px', paddingLeft: '210px' }}>
            <Button variant="dark" className="mt-2 ms-2 d-flex align-items-center" onClick={() => setServerVisible(true)}>
                Добавить сервер
            </Button>
            <Row className="w-100">
                <ServerList/>
            </Row>
            <CreateServer show={serverVisible} onHide={() => setServerVisible(false)}/>
        </Container>
    );
});

export default Servers;