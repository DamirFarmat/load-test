import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import {Button, Row} from "react-bootstrap";
import {observer} from "mobx-react-lite";
import AttackList from "../components/AttackList";
import CreateAttack from "../components/models/CreateAttack";

const Attack = observer(() => {
    const [attackVisible, setAttackVisible] = useState(false);

    return (
        <Container fluid>
            <div style={{ maxWidth: 340, marginLeft: 0 }}>
                <Button
                    variant="dark"
                    className="mb-3"
                    onClick={() => setAttackVisible(true)}
                >
                    Добавить тестирование
                </Button>
            </div>
            <div>
                <AttackList />
            </div>
            <CreateAttack show={attackVisible} onHide={() => setAttackVisible(false)}/>
        </Container>
    );
});

export default Attack;