import React from 'react';
import Container from "react-bootstrap/Container";
import {Button, Row} from "react-bootstrap";
import {observer} from "mobx-react-lite";
import AttackDetailsList from "../components/AttackDetailsList";

const AttackDetails = observer(() => {

    return (
        <Container fluid className="pe-3" style={{ marginTop: '76px', paddingLeft: '210px' }}>
            <Button
                variant="outline-dark"
                className="mt-2 ms-2 d-flex align-items-center"
                onClick={() => window.history.back()}>Назад
            </Button>
            <Row className="w-100">
                <AttackDetailsList/>
            </Row>
        </Container>
    );
});

export default AttackDetails;