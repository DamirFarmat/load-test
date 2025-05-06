import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../index";
import { fetchAttackOne, startAttack, stopAttack, saveChartData } from "../http/attackAPI";
import { Card, Button } from "react-bootstrap";
import { monitorTarget } from "../http/monitoringAPI";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer
} from "recharts";
import EditAttack from "./models/EditAttack";
import './AttackDetailsList.css';

const AttackDetailsList = () => {
    const { id } = useParams();
    const { load } = useContext(Context);
    const [attackData, setAttackData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [savedChartData, setSavedChartData] = useState([]);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [monitoringInterval, setMonitoringInterval] = useState(null);
    const [editAttackVisible, setEditAttackVisible] = useState(false);
    const [lastKnownResponseTime, setLastKnownResponseTime] = useState(null);

    useEffect(() => {
        if (!id) return;
        fetchAttackOne(id).then(data => {
            setAttackData(data);
            if (data.graph) {
                setSavedChartData(data.graph);
            }
        });
    }, [id]);

    useEffect(() => {
        // Логирование для диагностики
        console.log('chartData', chartData);
        const chartDataPrepared = chartData.map(d => ({
            ...d,
            redLine: d.unreachable ? null : d.responseTime,
            grayLine: d.unreachable ? d.responseTime : null,
        }));
        console.log('chartDataPrepared', chartDataPrepared);
    }, [chartData]);

    const startMonitoring = () => {
        if (isMonitoring || !attackData) return;

        setIsMonitoring(true);
        const interval = setInterval(async () => {
            let errorHappened = false;
            let response = null;
            try {
                const loadItem = load.loads.find(l => l.id === attackData.id_load);
                if (!loadItem) return;

                const type = loadItem.type;
                if (!attackData.target || !type) {
                    console.error("Некорректные данные для мониторинга:", {
                        target: attackData.target, type
                    });
                    return;
                }

                response = await monitorTarget(attackData.target, type);
                console.log('monitor:', {response, lastKnownResponseTime});
                if (response && typeof response.responseTime === "number" && response.responseTime !== null) {
                    setLastKnownResponseTime(response.responseTime);
                    setChartData(prev => [...prev.slice(-299), {
                        time: new Date().toLocaleTimeString(),
                        responseTime: response.responseTime,
                        unreachable: false
                    }]);
                } else if (((response && response.responseTime === null) || errorHappened)) {
                    setChartData(prev => [...prev.slice(-299), {
                        time: new Date().toLocaleTimeString(),
                        responseTime: 0,
                        unreachable: true
                    }]);
                }
            } catch (error) {
                errorHappened = true;
                console.error("Ошибка при мониторинге:", error);
            }
        }, 2000);

        setMonitoringInterval(interval);
    };

    const stopMonitoring = () => {
        setIsMonitoring(false);
        if (monitoringInterval) clearInterval(monitoringInterval);
        setMonitoringInterval(null);
    };

    const toggleAttack = async () => {
        if (!attackData) return;

        try {
            if (attackData.status === "yes") {
                await stopAttack(id);
            } else {
                await startAttack(id);
            }
            fetchAttackOne(id).then(data => setAttackData(data));
        } catch (error) {
            console.error("Ошибка при изменении статуса атаки:", error);
        }
    };

    const handleSaveChart = async () => {
        try {
            await saveChartData(id, chartData);
            alert('График успешно сохранен');
        } catch (error) {
            console.error('Ошибка при сохранении графика:', error);
            alert('Ошибка при сохранении графика');
        }
    };

    if (!attackData) {
        return <p>Загрузка...</p>;
    }

    const loadName =
        load.loads.find(load => load.id === attackData.id_load)?.name || "Неизвестный шаблон";

    // Подготовка данных для двух линий: красной и серой
    const chartDataPrepared = chartData.map(d => ({
        ...d,
        redLine: d.unreachable ? null : d.responseTime,
        grayLine: d.unreachable ? 0 : null,
    }));
    // Подготовка данных для двух линий для сохранённого графика
    const savedChartDataPrepared = savedChartData.map(d => ({
        ...d,
        redLine: d.unreachable ? null : d.responseTime,
        grayLine: d.unreachable ? 0 : null,
    }));
    console.log('chartDataPrepared', chartDataPrepared);

    // Кастомный компонент для линии с динамическим цветом
    const CustomLine = (props) => {
        const { points, data } = props;
        let path = '';
        points.forEach((point, i) => {
            if (i === 0) {
                path += `M${point.x},${point.y}`;
            } else {
                path += `L${point.x},${point.y}`;
            }
        });
        // Определяем цвет линии по последней точке (или можно по всем)
        const lastIdx = points.length - 1;
        const color = data && data[lastIdx] && data[lastIdx].unreachable ? '#888' : 'red';
        return <path d={path} stroke={color} fill="none" strokeWidth={2} />;
    };

    return (
        <div className="attack-details">
            <Card className="attack-info-card">
                <div className="attack-header">
                    <h3 className="attack-title">{attackData.name}</h3>
                    <div className="attack-labels">
                        {(attackData.labels || attackData.Labels || []).map((label, idx) => (
                            <div
                                key={idx}
                                className="attack-label"
                                style={{ backgroundColor: label.color }}
                            >
                                {label.name}
                            </div>
                        ))}
                    </div>
                    <div className="attack-actions">
                        <Button
                            variant={attackData.status === "yes" ? "outline-danger" : "outline-success"}
                            onClick={toggleAttack}
                            className="action-button"
                        >
                            {attackData.status === "yes" ? "⏹ Остановить" : "▶ Запустить"}
                        </Button>
                        <Button
                            variant="outline-primary"
                            onClick={() => setEditAttackVisible(true)}
                            className="action-button"
                        >
                            ✏️ Редактировать
                        </Button>
                    </div>
                </div>
                <div className="attack-info">
                    <p><strong>Цель:</strong> {attackData.target}</p>
                    <p><strong>Порт:</strong> {attackData.port ? attackData.port : "-"}</p>
                    <p><strong>Шаблон нагрузки:</strong> {loadName}</p>
                    <p><strong>Статус:</strong> {attackData.status === "yes" ? "Активна" : "Не активна"}</p>
                </div>

                <div className="monitoring-controls">
                    {!isMonitoring ? (
                        <Button variant="outline-primary" onClick={startMonitoring}>
                            📊 Начать отслеживание
                        </Button>
                    ) : (
                        <Button variant="outline-secondary" onClick={stopMonitoring}>
                            ⏹ Остановить отслеживание
                        </Button>
                    )}
                    {chartData.length > 0 && (
                        <Button variant="outline-success" onClick={handleSaveChart}>
                            💾 Сохранить график
                        </Button>
                    )}
                </div>
            </Card>

            {(isMonitoring || chartData.length > 0) && (
                <div className="chart-container">
                    <h4>График нагрузки</h4>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartDataPrepared}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="red" stopOpacity={0.8}/>
                                        <stop offset="50%" stopColor="red" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="red" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="5 5" />
                                <XAxis dataKey="time" />
                                <YAxis domain={[0, 'dataMax + 30']} />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="redLine"
                                    stroke="red"
                                    fill="url(#colorGradient)"
                                    dot={{ stroke: 'red', strokeWidth: 2, r: 3 }}
                                    isAnimationActive={false}
                                    connectNulls={false}
                                    name="responseTime"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="grayLine"
                                    stroke="#888"
                                    fill="none"
                                    dot={{ stroke: '#888', strokeWidth: 2, r: 3 }}
                                    isAnimationActive={false}
                                    connectNulls={false}
                                    name="unreachable"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div>Нет данных для отображения</div>
                    )}
                </div>
            )}

            {savedChartData.length > 0 && (
                <div className="chart-container">
                    <h4>Сохранённый график</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={savedChartDataPrepared}>
                            <defs>
                                <linearGradient id="savedColorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="green" stopOpacity={0.8}/>
                                    <stop offset="50%" stopColor="green" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="green" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="5 5" />
                            <XAxis dataKey="time" />
                            <YAxis domain={[0, 'dataMax + 30']} />
                            <Tooltip />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="redLine"
                                stroke="green"
                                fill="url(#savedColorGradient)"
                                dot={{ stroke: 'green', strokeWidth: 2, r: 3 }}
                                isAnimationActive={false}
                                connectNulls={false}
                                name="responseTime"
                            />
                            <Area
                                type="monotone"
                                dataKey="grayLine"
                                stroke="red"
                                fill="none"
                                dot={{ stroke: 'red', strokeWidth: 2, r: 3 }}
                                isAnimationActive={false}
                                connectNulls={false}
                                name="Host unreachable"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
            <EditAttack
                show={editAttackVisible}
                onHide={() => setEditAttackVisible(false)}
                attackId={attackData.id}
            />
        </div>
    );
};

export default AttackDetailsList;
