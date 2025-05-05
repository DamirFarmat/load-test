import React, { useState, useEffect } from 'react';
import { observer } from "mobx-react-lite";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import TerminalUI, { ColorMode, TerminalOutput } from 'react-terminal-ui';
import { execCommand } from '../http/sshAPI';
import { statusServer } from '../http/serverAPI';
import { useNavigate } from "react-router-dom";

const TerminalPage = observer(() => {
    const [terminalLineData, setTerminalLineData] = useState([
        <TerminalOutput key="initial">Welcome to the Servers Management!</TerminalOutput>
    ]);

    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const serverData = await statusServer();
                setServers(serverData);
            } catch (error) {
                console.error("Ошибка загрузки статусов серверов:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatuses(); // Загружаем статусы серверов только один раз при входе на страницу
    }, []);

    const handleCommand = async (terminalInput) => {
        if (terminalInput.trim().toLowerCase() === "clear") {
            setTerminalLineData([]);
            return;
        }

        // Добавляем команду в терминал
        setTerminalLineData((prevData) => [
            ...prevData,
            <TerminalOutput key={`${prevData.length}-command`}>$ {terminalInput}</TerminalOutput>
        ]);

        try {
            // Отправляем команду на все сервера одновременно
            const results = await Promise.all([
                // Добавьте вызовы execCommand для каждого сервера
                execCommand({ command: terminalInput })
            ]);

            // Обрабатываем результаты выполнения
            results.forEach((result) => {
                result.forEach((serverResult) => {
                    const outputLines = serverResult.output.split('\n');
                    outputLines.forEach((line, lineIndex) => {
                        if (line.trim()) {
                            setTerminalLineData((prevData) => [
                                ...prevData,
                                <TerminalOutput key={`${serverResult.ip}-${lineIndex}`}>
                                    [{serverResult.ip}] : {line}
                                </TerminalOutput>
                            ]);
                        }
                    });
                });
            });
        } catch (error) {
            setTerminalLineData((prevData) => [
                ...prevData,
                <TerminalOutput key="error">Ошибка выполнения команды: {error.message}</TerminalOutput>
            ]);
        }
    };

    return (
        <Container fluid>
            <Row className="ms-1">
                <Col md={8}>
                    <TerminalUI
                        name="Terminal"
                        colorMode={ColorMode.Dark}
                        onInput={handleCommand}
                    >
                        {terminalLineData}
                    </TerminalUI>
                </Col>

                <Col md={2}>
                    <h5 className="mb-3">Серверы</h5>

                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" size="sm" /> Загрузка информации...
                        </div>
                    ) : (
                        servers.map(server => (
                            <Card key={server.ip} className="mb-3"
                                  onClick={() => navigate(`/servers/${server.id}`)}
                                  style={{ cursor: "pointer" }}>
                                <Card.Body>
                                    <Card.Title>{server.ip}</Card.Title>
                                    <Card.Text>
                                        Статус: <span className={server.status === 'online' ? 'text-success' : 'text-danger'}>
                                            {server.status}
                                        </span>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </Col>
            </Row>
        </Container>
    );
});

export default TerminalPage;
