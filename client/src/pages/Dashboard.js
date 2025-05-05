import React from 'react';
import Container from "react-bootstrap/Container";
import {Row} from "react-bootstrap";
import {observer} from "mobx-react-lite";
import DashboardList from "../components/DashboardList";


const Dashboard = observer(() => {

    return (
        <Container fluid>
            <Row className="w-100">
                <DashboardList />
            </Row>
        </Container>

    );
});

export default Dashboard;