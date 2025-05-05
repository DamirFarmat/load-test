import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "react-bootstrap";
import { fetchServerOne, statusServerOne } from "../http/serverAPI";
import TerminalUI, {ColorMode, TerminalOutput} from "react-terminal-ui";
import {execCommandOne} from "../http/sshAPI";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { AreaChart, XAxis, YAxis, Tooltip, Area, ResponsiveContainer } from 'recharts';

const ServerDetailsList = () => {
    const [terminalLineData, setTerminalLineData] = useState([
        <TerminalOutput key="initial">Welcome to the Servers Management!</TerminalOutput>
    ]);

    const { id } = useParams();
    const [server, setServer] = useState(null);
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [cpuHistory, setCpuHistory] = useState([]);
    const [ramInfo, setRamInfo] = useState({ used: 0, total: 0, percent: 0 });
    const [monitorLoading, setMonitorLoading] = useState(true);

    const togglePasswordVisibility = (ip) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [ip]: !prev[ip],
        }));
    };

    useEffect(() => {
        fetchServerOne(id).then(data => setServer(data));
    }, [id]);

    useEffect(() => {
        let timeout;
        let isUnmounted = false;
        const fetchMonitor = async () => {
            try {
                if (!server?.id) return;
                const current = await statusServerOne(server.id);
                if (current && current.status === "online") {
                    // CPU
                    const cpuValue = parseFloat((current.cpu_usage || '0').replace('%', ''));
                    setCpuHistory(prev => {
                        const arr = [...prev, cpuValue];
                        return arr.length > 30 ? arr.slice(arr.length - 30) : arr;
                    });
                    // RAM
                    const memMatch = (current.memory_usage || '').match(/Used: ([\d.,]+) ?([A-Za-z]+), Free: ([\d.,]+) ?([A-Za-z]+)/);
                    if (memMatch) {
                        const used = parseFloat(memMatch[1].replace(',', '.'));
                        const free = parseFloat(memMatch[3].replace(',', '.'));
                        const total = used + free;
                        setRamInfo({ used, total, percent: total ? (used / total) * 100 : 0 });
                    }
                } else {
                    // offline или нет данных
                    setCpuHistory([]);
                    setRamInfo({ used: 0, total: 0, percent: 0 });
                }
            } catch (e) {
                // Сервер offline или ошибка — не выбрасываем ошибку, просто сбрасываем мониторинг
                setCpuHistory([]);
                setRamInfo({ used: 0, total: 0, percent: 0 });
            } finally {
                setMonitorLoading(false);
                if (!isUnmounted) {
                    timeout = setTimeout(fetchMonitor, 3000);
                }
            }
        };
        if (server?.id) {
            setMonitorLoading(true);
            fetchMonitor();
        }
        return () => {
            isUnmounted = true;
            clearTimeout(timeout);
        };
    }, [server?.id]);

    if (!server) {
        return <p className="m-2">Загрузка данных сервера...</p>;
    }

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
            const result = await execCommandOne(id, { command: terminalInput });

            const outputLines = result.output.split('\n');
            outputLines.forEach((line, lineIndex) => {
                if (line.trim()) {
                    setTerminalLineData((prevData) => [
                        ...prevData,
                        <TerminalOutput key={`${result.ip}-${lineIndex}`}>
                            {line}
                        </TerminalOutput>
                    ]);
                }
            });
        } catch (error) {
            setTerminalLineData((prevData) => [
                ...prevData,
                <TerminalOutput key="error">Ошибка выполнения команды: {error.message}</TerminalOutput>
            ]);
        }
    };

    return (
        <div>
            <Row>
                <Col md={8}>
                    <TerminalUI
                        name="Terminal"
                        colorMode={ColorMode.Dark}
                        onInput={handleCommand}
                    >
                        {terminalLineData}
                    </TerminalUI>
                </Col>
                <Col md={4}>
                    <Card className="p-4">
                        <h5 className="mb-3">Информация о сервере</h5>
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
                                onClick={() => togglePasswordVisibility(server.ip)}
                            >
                                        {visiblePasswords[server.ip] ? server.password : "******"}
                                    </span>
                        </p>
                    </Card>
                    <Card className="p-4 mt-4">
                        <h5 className="mb-3">Мониторинг сервера</h5>
                        {monitorLoading ? (
                            <div>Загрузка данных...</div>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <span style={{fontWeight: 500}}>CPU:</span>
                                    <div style={{height: 60}}>
                                        <ResponsiveContainer width="100%" height={60}>
                                            <AreaChart data={cpuHistory.map((v, i) => ({i, value: v}))}>
                                                <defs>
                                                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="black" stopOpacity={0.8}/>
                                                        <stop offset="100%" stopColor="black" stopOpacity={0.1}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="i" hide/>
                                                <YAxis domain={[0, 100]} hide/>
                                                <Tooltip />
                                                <Area type="monotone" dataKey="value" stroke="black" fill="url(#cpuGradient)" dot={false} isAnimationActive={false}/>
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={{fontSize: 14}}>{cpuHistory.length > 0 ? `${cpuHistory[cpuHistory.length-1].toFixed(1)}%` : 'N/A'}</div>
                                </div>
                                <div>
                                    <span style={{fontWeight: 500}}>RAM:</span>
                                    <ProgressBar now={ramInfo.percent} label={`${ramInfo.used.toFixed(2)} / ${ramInfo.total.toFixed(2)} GB`} style={{height: 20}} variant="dark"/>
                                </div>
                            </>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ServerDetailsList;
