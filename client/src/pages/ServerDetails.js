import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import {Button, Row} from "react-bootstrap";
import {observer} from "mobx-react-lite";
import ServerDetailsList from "../components/ServerDetailsList";

const ServerDetails = observer(() => {

    return (
        <Container fluid>
        <div style={{ maxWidth: 340, marginLeft: 0 }}>
            <Button
                variant="outline-dark"
                className="mb-3"
                onClick={() => window.history.back()}
            >
                Назад
            </Button>
        </div>
        <div>
            <ServerDetailsList />
        </div>
        </Container>
    );
});

export default ServerDetails;