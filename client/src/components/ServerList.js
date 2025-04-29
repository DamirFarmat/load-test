import React, { useContext, useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { Context } from "../index";
import { deleteServer, fetchServer, statusServer } from "../http/serverAPI";
import { Card, Button, Row, Col } from "react-bootstrap";

const ServerList = observer(() => {
    const { servers } = useContext(Context);
    const [statuses, setStatuses] = useState({});
    const [visiblePasswords, setVisiblePasswords] = useState({}); // Состояние видимости паролей
    const navigate = useNavigate();

    useEffect(() => {
        fetchServer().then(data => servers.setServer(data));
        let timeout;
        const fetchStatuses = async () => {
            try {
                const statusData = await statusServer();
                const statusMap = statusData.reduce((acc, server) => {
                    acc[server.ip] = server;
                    return acc;
                }, {});
                setStatuses(statusMap);
                timeout = setTimeout(fetchStatuses, 5000);
            } catch (error) {
                console.error("Ошибка загрузки статусов серверов:", error);
                timeout = setTimeout(fetchStatuses, 5000);
            }
        };
        fetchStatuses();
        return () => clearTimeout(timeout);
    }, []);

    const delServer = async (ip) => {
        const confirmed = window.confirm("Вы уверены, что хотите удалить этот сервер?");
        if (!confirmed) return;

        try {
            await deleteServer({ ip });
            fetchServer().then(data => servers.setServer(data));
        } catch (error) {
            console.error("Ошибка при удалении сервера:", error);
        }
    };

    // Функция переключения видимости пароля
    const togglePasswordVisibility = (ip) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [ip]: !prev[ip],
        }));
    };

    return (
        <div className="m-2"><Row>
            {servers.servers.map((server) => (
                <Col key={server.id} md={4} className="mb-3">
                    <Card
                        className="p-3 shadow-sm position-relative"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/servers/${server.id}`)}
                    >
                        <Button
                            variant="outline-dark"
                            className="position-absolute top-0 end-0 m-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                delServer(server.ip);
                            }}
                        >
                            ×
                        </Button>
                        <Row>
                            <Col xs={6} className="border-end">
                                <p><strong>IP:</strong> {server.ip}</p>
                                <p><strong>Логин:</strong> {server.login}</p>
                                <p>
                                    <strong>Пароль:</strong>{' '}
                                    <span
                                        style={{
                                            cursor: "pointer",
                                            color: "black",
                                            textDecoration: "none"
                                        }}
                                        onClick={e => { e.stopPropagation(); togglePasswordVisibility(server.ip); }}
                                    >
                                        {visiblePasswords[server.ip] ? server.password : "******"}
                                    </span>
                                </p>
                            </Col>
                            
                            <Col xs={6} className="d-flex flex-column">
                                {statuses[server.ip] ? (
                                    <>
                                        <p>
                                            <strong>Статус:</strong>{' '}
                                            <span>
                                                {statuses[server.ip].status === "online" ? "Online 🟢" : "Offline 🔴"}
                                            </span>
                                        </p>
                                        <p><strong>CPU:</strong> {statuses[server.ip].cpu_usage || "N/A"}</p>
                                        <p><strong>RAM:</strong> {statuses[server.ip].memory_usage || "N/A"}</p>
                                    </>
                                ) : (
                                    <p>Загрузка данных...</p>
                                )}
                            </Col>
                        </Row>
                    </Card>
                </Col>
            ))}
        </Row></div>

    );
});

export default ServerList;
