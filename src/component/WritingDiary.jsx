import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import API from './API';
import SidePanel from "./SidePanel";
import imageMapping from './imageMapping';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { FaDeleteLeft } from "react-icons/fa6";

import back3 from '../img/back3.png';

function WritingDiary() {

    const [activeBackId, setActiveBackId] = useState("");
    const [selectedKey, setSelectedKey] = useState([]);
    const [tempDiary, setTempDiary] = useState("");
    const [loading, setLoading] = useState(false);
    const [diary, setDiary] = useState("");
    //diaryState : 0 -> before writing, 1 -> modifying, 2 -> modifiable
    const [diaryState, setDiaryState] = useState(0);
    const inputTag = useRef();
    const modifiedDiary = useRef();

    const BACKGROUND_IMAGE_COL_NUM = 6;

    useEffect(() => {
        if (loading) {
            document.body.style = 'overflow: hidden';
        } else {
            document.body.style = 'overflow: unset';
        }
    }, [loading])

    const backgroundHandler = (e) => {
        setActiveBackId(e.target.id);
        console.log(activeBackId);
    }
    const keyInput = (e) => {
        if (e.key === 'Enter') {
            let input = inputTag.current.value.trim();
            if (input !== '') {
                setSelectedKey([...selectedKey, input]);
                inputTag.current.value = "";
            }
        }
    }
    const showSelectedKey = (arr) => {
        return arr.map((key, idx) => (
            <span
                key={idx}
                style={{
                    display: 'inline-block',
                    padding: '5px',
                    border: '#0093ED 2px solid',
                    borderRadius: '7px',
                }}
            >
                {key}
                <FaDeleteLeft style={{ marginLeft: '5px' }} onClick={() => { deleteKey(idx) }} />
            </span>
        ))
    }

    const deleteKey = (idx) => {
        setSelectedKey(selectedKey.filter((_, i) =>
            i !== idx
        ));
    }

    const diaryModifyHandler = (e) => {
        setTempDiary(e.target.value);
    }

    const renderBackground = () => {
        const len = Object.keys(imageMapping).length;
        let rowNum = Math.floor(len / BACKGROUND_IMAGE_COL_NUM);
        let cols = [];
        let rows = [];
        let sliceCols = [];

        for (let key in imageMapping) {

            cols.push((
                <Col
                    className='background_paper'
                    style={{ border: activeBackId === key ? 'black 1px solid' : 'rgb(205, 201, 201) 1px solid' }}
                >
                    <img src={process.env.PUBLIC_URL + imageMapping[key]} alt="" id={key} onClick={backgroundHandler} />
                </Col>
            ))
        }

        for (let i = 0; i < rowNum; i++) {
            sliceCols = cols.slice(BACKGROUND_IMAGE_COL_NUM * i, BACKGROUND_IMAGE_COL_NUM * (i + 1));
            rows.push((<Row>
                {sliceCols}
            </Row>));
        }
        return (
            <>{rows}</>
        )
    }

    const writeDiary = async (a) => {
        let date = new Date().toLocaleDateString();
        let keywordString = "";
        let params;

        for (let i = 0; i < selectedKey.length; i++) {
            if (i == 0) {
                keywordString += selectedKey[i];
            }
            else {
                keywordString += ',' + selectedKey[i];
            }

        }

        params = {
            'username': 'Lee Jungbeen',
            'userInput': keywordString,
            'todayDate': date
        }
        const PROXY = window.location.hostname === 'localhost' ? '' : '/proxy';
        const URL = `${PROXY}`;
        try {
            // await API.post("/dutch", {
            await axios.post("http://52.78.72.107:8080/gpt/diary/dutch", null, { params: params, withCredentials: true }).then(res => {
                setLoading(false);
                console.log(res);
                setDiary(res.data);
                setTempDiary(res.data);
                setDiaryState(2);
            });

        } catch (error) {
            console.error("There was an error in Post!", error);
        }

        // try {
        //     //error: gpt get method 없음
        //     const res = await API.get('/gpt');
        //     console.log(res.data);
        //     setDiary(res.data.message.content);
        //     setTempDiary(res.data.message.content);
        // } catch (error) {
        //     console.error("There was an error in Get!", error);
        // }
    }

    const sendDiary = async () => {
        //error: put method 없음

        if (diary.length != 0) {
            try {
                await axios.post('/diaries', {
                    'userId': 3812456,
                    'content': diary
                }).then(() => {
                    setLoading(true);
                    setDiaryState(0);
                    window.scrollTo({ top: 0 });
                    setSelectedKey([]);
                })
            } catch (error) {
                console.error("There was an error in DiaryPost!", error)
            }

        }
    }

    return (
        <div>
            <SidePanel />
            <div className='mainscreen' style={{ marginRight: '200px' }}>

                {diaryState === 0 &&
                    <div>
                        <p style={{
                            color: '#0093ED',
                            fontSize: '50px',
                            fontFamily: 'poetsenone',
                            marginBottom: '70px'
                        }}>
                            How Was Your Day?
                        </p>
                        <p style={{
                            fontFamily: 'poetsenone',
                            marginBottom: '10px'
                        }}>
                            Press Enter Key After Each Keyword
                        </p>
                        <Form.Floating className="mb-3">
                            <Form.Control
                                id="floatingInputCustom"
                                placeholder="key1sds"
                                onKeyDown={keyInput}
                                ref={inputTag}
                            />
                            <label htmlFor="floatingInputCustom" style={{ color: '#0093ED' }}>Keyword</label>
                        </Form.Floating>

                        <div id='selectedKey'>{showSelectedKey(selectedKey)}</div>

                        <div id='background_select'>
                            <Container>
                                {renderBackground()}
                            </Container>
                        </div>
                        <div className='button_case'>
                            <span className="button_outer" onClick={() => {
                                if (selectedKey.length > 0) {
                                    setLoading(true);
                                    writeDiary(selectedKey);
                                    // setDiaryState(2);
                                }
                            }}>
                                <span className="button_inner"></span>
                                WRITE
                            </span>
                        </div>
                    </div>
                }
                {diaryState === 1 &&
                    <div>
                        <Form.Control
                            as="textarea"
                            placeholder="Leave a comment here"
                            style={{ height: '600px' }}
                            value={tempDiary}
                            ref={modifiedDiary}
                            onChange={diaryModifyHandler}
                        />
                        <div className='button_case' style={{ width: '100%', marginTop: '20px', height: '60px' }}>
                            <span className="button_outer" onClick={() => {
                                if (tempDiary.length > 0) {
                                    setDiary(tempDiary);
                                    setDiaryState(2);
                                    window.scrollTo({ top: 0 });
                                    // setDiary(modifiedDiary.current.value)
                                }
                            }}>
                                <span className="button_inner"></span>
                                APPLY
                            </span>
                        </div>
                    </div>
                }
                {diaryState === 2 &&
                    <div>
                        <div id='modifiable' style={{
                            backgroundImage: `url(${back3})`
                        }}>
                            {diary}
                        </div>
                        <div className='button_case' style={{ width: '630px', height: '60px' }}>
                            <span className="button_outer" onClick={() => { setDiaryState(1); window.scrollTo({ top: 0 }) }}>
                                <span className="button_inner"></span>
                                MODIFY
                            </span>
                        </div>
                        <div className='button_case' style={{ width: '630px', marginTop: '20px', height: '60px' }}>
                            <span className="button_outer" onClick={() => {
                                setLoading(true);
                                sendDiary();
                                // setDiaryState(0);
                                // window.scrollTo({ top: 0 });
                                // setSelectedKey([]);
                            }}>
                                <span className="button_inner"></span>
                                SAVE
                            </span>
                        </div>
                    </div>
                }
                {loading &&
                    <div id="modal-wrap">
                        <Spinner animation="border" role="status" id='spinner'>
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                }
            </div>

        </div>
    );
}

export default WritingDiary;