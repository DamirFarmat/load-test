import React from 'react';
import Container from "react-bootstrap/Container";
import {Row} from "react-bootstrap";
import {observer} from "mobx-react-lite";
import DashboardList from "../components/DashboardList";


const Dashboard = observer(() => {

    return (
        <Container fluid className="pe-3" style={{ marginTop: '76px', paddingLeft: '210px' }}>
            <Row className="w-100">
                <DashboardList />
            </Row>
        </Container>

    );
});

export default Dashboard;