import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { fetchLoad } from '../http/loadAPI';
import { fetchAttack } from '../http/attackAPI';
import { fetchServer } from '../http/serverAPI';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { useNavigate } from 'react-router-dom';

const DashboardList = () => {
    const [loadsCount, setLoadsCount] = useState(null);
    const [attacksCount, setAttacksCount] = useState(null);
    const [serversCount, setServersCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastGraph, setLastGraph] = useState(null);
    const [lastGraphName, setLastGraphName] = useState('');
    const [lastGraphId, setLastGraphId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const loads = await fetchLoad();
                const attacks = await fetchAttack();
                const servers = await fetchServer();
                setLoadsCount(loads.length);
                setAttacksCount(attacks.length);
                setServersCount(servers.length);

                // Найти последнюю атаку с сохранённым графиком
                const lastWithGraph = [...attacks].reverse().find(a => Array.isArray(a.graph) && a.graph.length > 0);
                if (lastWithGraph) {
                    setLastGraph(lastWithGraph.graph);
                    setLastGraphName(lastWithGraph.name);
                    setLastGraphId(lastWithGraph.id);
                }
            } catch (e) {
                setLoadsCount('Ошибка');
                setAttacksCount('Ошибка');
                setServersCount('Ошибка');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center" style={{height: 200}}><Spinner animation="border" /></div>;
    }

    return (
        <div className="m-2">
            <Row className="justify-content-center mt-4 mb-4">
                <Col md={3} className="mb-4">
                    <Card className="p-3 shadow-sm text-center position-relative border card-hover" style={{cursor: 'pointer'}} onClick={() => navigate('/loads')}>
                        <Card.Body>
                            <Card.Title className="fw-bold">Шаблоны</Card.Title>
                            <Card.Text style={{fontSize: '2rem'}}>{loadsCount}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-4">
                    <Card className="p-3 shadow-sm text-center position-relative border card-hover" style={{cursor: 'pointer'}} onClick={() => navigate('/attack')}>
                        <Card.Body>
                            <Card.Title className="fw-bold">Тестирования</Card.Title>
                            <Card.Text style={{fontSize: '2rem'}}>{attacksCount}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-4">
                    <Card className="p-3 shadow-sm text-center position-relative border card-hover" style={{cursor: 'pointer'}} onClick={() => navigate('/servers')}>
                        <Card.Body>
                            <Card.Title className="fw-bold">Серверы</Card.Title>
                            <Card.Text style={{fontSize: '2rem'}}>{serversCount}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {lastGraph && lastGraph.length > 0 && (
                <Card className="p-4 shadow-sm mt-4 mb-4" style={{maxWidth: 1200, margin: '0 auto'}}>
                    <h4 className="fw-bold mb-3">Последний сохранённый график</h4>
                    <div className="mb-2" style={{fontSize: '1.2rem', color: '#198754'}}>
                        <b style={{cursor: 'pointer'}} onClick={() => navigate(`/attack/${lastGraphId}`)}>{lastGraphName}</b>
                    </div>
                    <AreaChart data={lastGraph} width={1100} height={300}>
                        <defs>
                            <linearGradient id="dashboardSavedColorGradient" x1="0" y1="0" x2="0" y2="1">
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
                            dataKey="responseTime"
                            stroke="green"
                            fill="url(#dashboardSavedColorGradient)"
                            dot={false}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </Card>
            )}
        </div>
    );
};

export default DashboardList;
