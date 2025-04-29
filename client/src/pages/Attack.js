import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import {Button, Row} from "react-bootstrap";
import {observer} from "mobx-react-lite";
import AttackList from "../components/AttackList";
import CreateAttack from "../components/models/CreateAttack";

const Attack = observer(() => {
    const [attackVisible, setAttackVisible] = useState(false);

    return (
        <Container fluid className="pe-3" style={{ marginTop: '76px', paddingLeft: '210px' }}>
            <Button variant={"dark"} className="mt-2 ms-2 d-flex align-items-center" onClick={() => setAttackVisible(true)}>
                Добавить тестирование
            </Button>
            <Row className="w-100">
                <AttackList/>
            </Row>
            <CreateAttack show={attackVisible} onHide={() => setAttackVisible(false)}/>
        </Container>
    );
});

export default Attack;