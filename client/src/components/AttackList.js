import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { useNavigate } from "react-router-dom";
import { Button, ListGroup, Dropdown } from "react-bootstrap";
import { deleteAttack, fetchAttack, startAttack, stopAttack, duplicateAttack } from "../http/attackAPI";
import EditAttack from "./models/EditAttack";

import "./AttackList.css";
import startImage from "./img/start.png";
import stopImage from "./img/stop.png";


const AttackList = observer(() => {
    const { attack, load } = useContext(Context);
    const navigate = useNavigate();
    const [editAttackVisible, setEditAttackVisible] = useState(false);
    const [selectedAttackId, setSelectedAttackId] = useState(null);
    const [showDropdown, setShowDropdown] = useState(null);

    useEffect(() => {
        fetchAttack().then(data => attack.setAttacks(data));
    }, []);

    const delAttack = async (name) => {
        if (!window.confirm("Вы уверены, что хотите удалить это тестирование?")) return;

        try {
            await deleteAttack({ name });
            fetchAttack().then(data => attack.setAttacks(data));
        } catch (error) {
            console.error("Ошибка при удалении атаки:", error);
        }
    };

    const toggleAttack = async (id, isRunning) => {
        try {
            if (isRunning) {
                await stopAttack(id);
            } else {
                await startAttack(id);
            }
            fetchAttack().then(data => attack.setAttacks(data));
        } catch (error) {
            console.error("Ошибка при изменении статуса атаки:", error);
        }
    };

    const handleEdit = (attackId) => {
        setSelectedAttackId(attackId);
        setEditAttackVisible(true);
    };

    const handleDuplicate = async (attackId) => {
        try {
            await duplicateAttack(attackId);
            fetchAttack().then(data => attack.setAttacks(data));
        } catch (error) {
            console.error("Ошибка при дублировании атаки:", error);
        }
    };

    return (
        <div className="m-2">
            <ListGroup>
                {attack.attacks.map((attack) => {
                    const loadName = load.loads.find(load => load.id === attack.id_load)?.name || "Неизвестный шаблон";
                    const isRunning = attack.status === "yes";

                    return (
                        <ListGroup.Item
                            key={attack.id}
                            className="d-flex justify-content-between align-items-center"
                            onClick={() => navigate(`/attack/${attack.id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <div>
                                <strong>{attack.name}</strong> ({attack.target}) - {loadName}
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="d-flex flex-wrap gap-2 me-2">
                                    {attack.labels && attack.labels.length > 0 && attack.labels.map((label, index) => (
                                        <div 
                                            key={index}
                                            style={{
                                                backgroundColor: label.color,
                                                color: 'black',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {label.name}
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant={isRunning ? "outline-danger" : "outline-success"}
                                    style={{ border: "none", marginRight: "10px" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAttack(attack.id, isRunning);
                                    }}
                                >
                                    <img src={isRunning ? stopImage : startImage} alt="Toggle" style={{ width: "20px" }} />
                                </Button>
                                <Dropdown
                                    show={showDropdown === attack.id}
                                    onToggle={(isOpen) => setShowDropdown(isOpen ? attack.id : null)}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <Dropdown.Toggle className="no-caret" variant="outline-secondary" style={{ border: "none" }}>
                                        <span style={{ fontSize: "1.2rem" }}>⋮</span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(attack.id);
                                            setShowDropdown(null);
                                        }}>
                                            Редактировать
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={(e) => {
                                            e.stopPropagation();
                                            handleDuplicate(attack.id);
                                            setShowDropdown(null);
                                        }}>
                                            Дублировать
                                        </Dropdown.Item>
                                        <Dropdown.Item style={{ color: 'red' }} onClick={(e) => {
                                            e.stopPropagation();
                                            delAttack(attack.name);
                                            setShowDropdown(null);
                                        }}>
                                            Удалить
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
            <EditAttack 
                show={editAttackVisible} 
                onHide={() => setEditAttackVisible(false)}
                attackId={selectedAttackId}
            />
        </div>
    );
});

export default AttackList;
