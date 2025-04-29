import React, {useContext, useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {Dropdown, Form} from "react-bootstrap";
import {createAttack} from "../../http/attackAPI";
import {Context} from "../../index";
import {fetchLoad} from "../../http/loadAPI";
import { fetchLabels, deleteLabel } from "../../http/labelAPI";

const CreateAttack = ({show, onHide}) => {
    const {load} = useContext(Context)
    const [showLabelForm, setShowLabelForm] = useState(false);
    const [labelName, setLabelName] = useState('');
    const [labelColor, setLabelColor] = useState('#000000');
    const [labels, setLabels] = useState([]);
    const [allLabels, setAllLabels] = useState([]);
    const [labelNameError, setLabelNameError] = useState(false);

    const colorPalette = [
        '#62f3ae', '#3f95fc', '#f074bc', '#1e1878', '#04ddd4',
        '#a674f1', '#FFA500', '#ff9895'
    ];

    useEffect(() => {
        fetchLoad().then(data => load.setLoads(data));
        fetchLabels().then(data => setAllLabels(data));
    }, [load]);

    const [Name, setName] = useState('');
    const [Target, setTarget] = useState('');
    const [Port, setPort] = useState('');
    const [Time, setTime] = useState('');
    const [Load, setLoadName] = useState('');
    const [LoadId, setLoadId] = useState(null);
    const [errors, setErrors] = useState({
        name: false,
        target: false,
        time: false,
    });

    const addAttack = () => {
        const validationErrors = {
            name: Name.trim() === '',
            target: Target.trim() === '',
            time: Time.trim() === '',
            load: Load.trim() === '',
        };

        setErrors(validationErrors);
        if (Object.values(validationErrors).includes(true)) return;

        const portToSend = Port.trim() === "" ? null : Port;

        createAttack({
            name: Name, 
            target: Target, 
            port: portToSend, 
            time: Time, 
            id_load: LoadId,
            labels: labels
        }).then(data => {
            setName('')
            setTarget('')
            setPort('')
            setTime('')
            setLoadName('');
            setLoadId(null)
            setLabels([])
            setLabelName('')
            setLabelColor('#000000')
            setErrors({ name: false, target: false, time: false, load:false });
            onHide()
            window.location.reload()
        }).catch(() => {});
    }

    const handleAddLabel = () => {
        if (labelName.trim() === '') {
            setLabelNameError(true);
            return;
        }
        setLabels([...labels, {
            name: labelName,
            color: labelColor
        }]);
        setLabelName('');
        setLabelColor('#000000');
        setShowLabelForm(false);
        setLabelNameError(false);
    };

    const removeLabel = (index) => {
        setLabels(labels.filter((_, i) => i !== index));
    };

    const handleToggleLabel = (label) => {
        if (labels.some(l => l.name === label.name)) {
            setLabels(labels.filter(l => l.name !== label.name));
        } else {
            setLabels([...labels, label]);
        }
    };

    const handleDeleteLabel = async (label) => {
        if (!label.id) {
            setLabels(labels.filter(l => l !== label));
            return;
        }
        if (window.confirm("Вы уверены, что хотите удалить ярлык?")) {
            await deleteLabel(label.id);
            setAllLabels(allLabels.filter(l => l.id !== label.id));
            setLabels(labels.filter(l => l.id !== label.id));
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Добавить новое тестирование
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    Название тестирования
                    <Form.Group className="mb-3">
                        <Form.Control
                            value={Name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Name"
                            style={{ borderColor: errors.name ? 'red' : '' }}
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Dropdown>
                            <Dropdown.Toggle variant={"dark"} style={{ borderColor: errors.load ? 'red' : '' }}>{Load || "Выберите шаблон тестирования"}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                {Array.isArray(load.loads) && load.loads.length > 0 ? (
                                    load.loads.map(load => (
                                        <Dropdown.Item
                                            key={load.id}
                                            onClick={() => {
                                            setLoadName(load.name);
                                            setLoadId(load.id)
                                            }}
                                        >
                                            {load.name}
                                        </Dropdown.Item>
                                    ))
                                ) : (
                                    <Dropdown.Item disabled>Нет доступных шаблонов</Dropdown.Item>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Form.Group>

                    Например "192.168.10.1"
                    <Form.Group className="mb-3">
                        <Form.Control
                            value={Target}
                            onChange={e => setTarget(e.target.value)}
                            placeholder="{{target}}"
                            style={{ borderColor: errors.target ? 'red' : '' }}
                        />
                    </Form.Group>

                    Например "443"
                    <Form.Group className="mb-3">
                        <Form.Control
                            value={Port}
                            onChange={e => setPort(e.target.value)}
                            placeholder="{{port}}"
                        />
                    </Form.Group>

                    Например "5" (мин.).
                    <Form.Group className="mb-3">
                        <Form.Control
                            value={Time}
                            onChange={e => setTime(e.target.value)}
                            placeholder="Time"
                            style={{ borderColor: errors.time ? 'red' : '' }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <div className="d-flex flex-wrap gap-2 mb-2">
                            {labels.map((label, index) => (
                                <div 
                                    key={index}
                                    className="d-flex align-items-center"
                                    style={{
                                        backgroundColor: label.color,
                                        color: 'black',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        marginRight: '8px',
                                        position: 'relative',
                                        minWidth: '60px',
                                        minHeight: '28px',
                                        display: 'inline-block'
                                    }}
                                >
                                    {label.name}
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => removeLabel(index)}
                                        style={{
                                            border: 'none',
                                            padding: '0 5px',
                                            fontSize: '1rem',
                                            lineHeight: '1',
                                            position: 'absolute',
                                            top: '-6px',
                                            right: '-6px',
                                            background: 'white',
                                            color: 'black',
                                            borderRadius: '50%',
                                            width: '18px',
                                            height: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 2
                                        }}
                                        title="Убрать из выбранных"
                                    >
                                        ×
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowLabelForm(true)}
                        >
                            + Добавить ярлык
                        </Button>
                    </Form.Group>

                    {showLabelForm && (
                        <Form.Group className="mb-3">
                            <div className="mb-2">Выберите существующие ярлыки:</div>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                                {allLabels.map((label, idx) => {
                                    const isSelected = labels.some(l => l.id === label.id);
                                    return (
                                        <div key={idx} className="d-flex align-items-center me-3 mb-2" style={{position: 'relative', minWidth: '60px', minHeight: '28px', display: 'inline-block'}}>
                                            <div
                                                onClick={() => handleToggleLabel(label)}
                                                style={{
                                                    backgroundColor: label.color,
                                                    color: 'black',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    marginRight: '4px',
                                                    boxShadow: isSelected ? '0 0 0 2px #333' : 'none',
                                                    border: isSelected ? '2px solid #333' : 'none',
                                                    userSelect: 'none',
                                                    minWidth: '60px',
                                                    minHeight: '28px',
                                                    display: 'inline-block',
                                                    position: 'relative'
                                                }}
                                                title={isSelected ? 'Убрать из выбранных' : 'Добавить к выбранным'}
                                            >
                                                {label.name}
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={e => { e.stopPropagation(); handleDeleteLabel(label); }}
                                                    style={{
                                                        border: 'none',
                                                        padding: '0 5px',
                                                        fontSize: '1rem',
                                                        lineHeight: '1',
                                                        position: 'absolute',
                                                        top: '-6px',
                                                        right: '-6px',
                                                        background: 'white',
                                                        color: 'red',
                                                        borderRadius: '50%',
                                                        width: '18px',
                                                        height: '18px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        zIndex: 2
                                                    }}
                                                    title="Удалить ярлык"
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mb-2">Или добавьте новый ярлык:</div>
                            <div className="d-flex flex-column gap-2">
                                <Form.Control
                                    value={labelName}
                                    onChange={e => {
                                        setLabelName(e.target.value);
                                        if (labelNameError) setLabelNameError(false);
                                    }}
                                    style={{ borderColor: labelNameError ? 'red' : '' }}
                                    placeholder="Название ярлыка"
                                />
                                <div className="d-flex gap-2">
                                    {colorPalette.map((color, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                width: '30px',
                                                height: '30px',
                                                backgroundColor: color,
                                                borderRadius: '50%',
                                                cursor: 'pointer',
                                                border: labelColor === color ? '2px solid #000' : 'none'
                                            }}
                                            onClick={() => setLabelColor(color)}
                                        />
                                    ))}
                                </div>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-success"
                                        onClick={handleAddLabel}
                                    >
                                        Добавить
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        onClick={() => setShowLabelForm(false)}
                                    >
                                        Отмена
                                    </Button>
                                </div>
                            </div>
                        </Form.Group>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>Закрыть</Button>
                <Button variant="outline-success" onClick={addAttack}>Добавить</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateAttack;