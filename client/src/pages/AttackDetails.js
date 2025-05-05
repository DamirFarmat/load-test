import React from 'react';
import Container from "react-bootstrap/Container";
import {Button, Row} from "react-bootstrap";
import {observer} from "mobx-react-lite";
import AttackDetailsList from "../components/AttackDetailsList";

const AttackDetails = observer(() => {

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
            <AttackDetailsList />
        </div>
        </Container>
    );
});

export default AttackDetails;