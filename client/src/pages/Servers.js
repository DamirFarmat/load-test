import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import {Button, Row} from "react-bootstrap";
import ServerList from "../components/ServerList";
import CreateServer from "../components/models/CreateServer";
import {observer} from "mobx-react-lite";

const Servers = observer(() => {
    const [serverVisible, setServerVisible] = useState(false);
    
    return (
        <Container fluid>
            <div style={{ maxWidth: 340, marginLeft: 0 }}>
                <Button
                    variant="dark"
                    className="mb-3"
                    onClick={() => setServerVisible(true)}
                >
                    Добавить сервер
                </Button>
            </div>
            <div style={{ marginLeft: -12 }}>
                <ServerList />
            </div>
            <CreateServer show={serverVisible} onHide={() => setServerVisible(false)}/>
        </Container>
    );
});

export default Servers;