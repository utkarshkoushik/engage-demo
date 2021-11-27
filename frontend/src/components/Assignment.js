import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import UploadFile from './UploadFile';
import axios from 'axios';
import { api } from '../screen/Helper';
import Pdf from './Pdf';
// import { Document, Page } from 'react-pdf';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function Assignment(props) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const token = localStorage.getItem('token');
    const [currA, setCurr] = useState([]);
    const [pastA, setPast] = useState([]);
    const [selectedFile, setSelectedFile] = useState();

    const [isAssignActive, setIsAssignActive] = useState(false);
    const [currAssign, setCurrAssign] = useState("");
    const [currAssignData, setCurrAssignData] = useState();
    const [dueDate, setDueDate] = useState();
    useEffect(() => {
        axios({
            method: 'post',
            url: api + 'teams/get_assignments',
            data: {
                team_slug: props.team_slug,
            },
            headers: {
                Authorization: "Token " + token
            }
        })
            .then(res => {
                console.log(res.data);
                setCurr(res.data.active_assign);
                setPast(res.data.past_assign);
            })
            .catch(err => {
                console.log(err);
            })
    }, [])
    const [heading, setHeading] = useState({
        value: "",
        error: false,
        helperText: ""
    })
    const [instructions, setInstructions] = useState({
        value: "",
        error: false,
        helperText: ""
    })
    const [attachment, setAttachment] = useState({
        value: "",
        error: false,
        helperText: ""
    })
    const [deadline, setDeadline] = useState({
        value: "",
        error: false,
        helperText: ""
    })
    const [maxPt, setMaxPt] = useState({
        value: "",
        error: false,
        helperText: ""
    })

    const [link, setLink] = useState("");

    const [input1,setInput1] = useState();
    const [input2,setInput2] = useState();
    const [input3,setInput3] = useState();
    const [output1,setOutput1] = useState();
    const [output2,setOutput2] = useState();
    const [output3,setOutput3] = useState();
    
    const handleHeading = (e) => {
        setHeading({
            value: e.target.value,
            error: false,
            helperText: ""
        })

    }

    const handleInstructions = (e) => {
        setInstructions({
            value: e.target.value,
            error: false,
            helperText: ""
        })
    }

    const handleDeadline = (e) => {
        console.log(e.target.value);
        setDeadline({
            value: e.target.value,
            error: false,
            helperText: ""
        })
    }

    const handleAttachment = (e) => {
        setAttachment({
            value: e.target.value,
            error: false,
            helperText: ""
        })
    }

    const handleMaxPt = (e) => {
        setMaxPt({
            value: e.target.value,
            error: false,
            helperText: ""
        })
    }
    const handleCreate = () => {
        if (heading.value == "") {
            setHeading({
                value: "",
                error: true,
                helperText: "Heading cannot be left blank"
            })
        }
        if (deadline.value == "") {
            setDeadline({
                value: "",
                error: true,
                helperText: "Deadline cannot be left blank"
            })
        }
        if (maxPt.value == "") {
            setMaxPt({
                value: "",
                error: true,
                helperText: "Maximum Points cannot be left blank"
            })
        }
        if (maxPt.value != "" && deadline.value != "" && heading.value != "") {

            const formData = new FormData();
            const deadlineSec = new Date(deadline.value);
            formData.append("team_slug", props.team_slug);
            formData.append("name", heading.value);
            formData.append("due_at", deadlineSec.getTime());
            formData.append("closes_at", deadlineSec.getTime());
            formData.append("description", instructions.value);
            formData.append("max_score", maxPt.value);
            formData.append("attachment", selectedFile);
            formData.append("input1",input1);
            formData.append("input2",input2);
            formData.append("input3",input3);
            formData.append("output1",output1);
            formData.append("output2",output2);
            formData.append("output3",output3);

            console.log(formData);
            axios({
                method: 'post',
                url: api + 'teams/create_assignment',
                data: formData,
                headers: {
                    Authorization: "Token " + token
                }
            })
                .then(res => {
                    console.log(res.data);
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }

    const handleOpenAssignment = (i) => {
        console.log(i);
        setIsAssignActive(true);
        setCurrAssign(i.assignment_slug);
    }

    const handleOpenPdf = (link) => {
        if (link != "") {
            setPdfOpen(true);
            setLink(link);
        }

    }

    const getAssignment = () => {
        axios({
            method: 'post',
            url: api + 'teams/get_submission',
            data: {
                assignment_slug: currAssign,
            },
            headers: {
                Authorization: "Token " + token
            }
        })
            .then(res => {
                console.log(res.data);
                setCurrAssignData(res.data);
                const date = new Date(res.data.assignment.due_at);
                const dateStr = date.getHours() + ":" + date.getMinutes() + " " + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
                setDueDate(dateStr);

            })
            .catch(err => {
                console.log(err);
            })
    }

    useEffect(() => {
        if (currAssign != "") {
            getAssignment();
        }
    }, [currAssign])


    const assignCard = (assign) => {
        const docs = [
            { uri: "https://www.engage21.me:9000" + assign.attachment }
        ]
        return (
            <div onClick={() => handleOpenAssignment(assign)} style={{ backgroundColor: 'darkgray', marginTop: 20, padding: 20, cursor: 'pointer' }}>
                <p style={{ fontSize: 16, fontWeight: 'normal', textAlign: 'left' }}>
                    {assign.name}
                </p>

                {/* {assign.attachment && 
                    <div style={{marginTop: 20}}>
                        <Pdf link={assign.attachment} />
                    </div>
                } */}
            </div>
        )
    }

    const past = () => {
        if (pastA.length == 0) {
            return (
                <p style={{ textAlign: 'center', fontSize: 20, fontWeight: 'normal' }}>
                    No previous assignments.
                </p>
            )
        }
        return (

            pastA.map(i => assignCard(i))
        )
    }

    const active = () => {
        if (currA.length == 0) {
            return (
                <p style={{ textAlign: 'center', fontSize: 20, fontWeight: 'normal' }}>
                    No active assignments.
                </p>
            )
        }
        return (
            currA.map(i => assignCard(i))
        )
    }


    const onFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    }

    const fileData = () => {
        if (selectedFile) {
            return (
                <div>
                    <p>File Name: {selectedFile.name}</p>
                </div>
            );
        }
        else {
            return (
                <div></div>
            )
        }
    }
    const [pdfOpen, setPdfOpen] = useState(false);
    // const handlePdfOpen=()=>{
    //     setPdfOpen(true);
    // }
    const [grade, setGrade] = useState({
        value: '',
        error: false,
        helperText: ''
    })
    const [openGrade, setOpenGrade] = useState(false);

    const handleCloseGrade = () => {
        setOpenGrade(false);
    }

    const handleGradeChange = (e) => {
        setGrade({
            value: e.target.value,
            error: false,
            helperText: ''
        })
    }

    const submitGrade = (user_id) => {
        console.log(user_id, grade.value);
        if (grade.value != '') {
            axios({
                method: 'post',
                url: api + 'teams/grade_assignment',
                data: {
                    assignment_slug: currAssign,
                    student_id: user_id,
                    points: grade.value
                },
                headers: {
                    Authorization: "Token " + token
                }
            })
                .then(res => {
                    console.log(res.data);
                    setGrade({
                        value: '',
                        error: false,
                        helperText: ''
                    })
                    setOpenGrade(false);
                    getAssignment();

                })
                .catch(err => {
                    console.log(err);
                })
        }
        else {
            setGrade({
                value: "",
                error: true,
                helperText: 'Grade cannot be blank'
            })
        }
    }

    const submission = () => {
        return (
            <div>
                {currAssignData && currAssignData.submissions.map(i =>
                    <div style={{ backgroundColor: 'white', padding: 10, border: '1px solid grey', marginBottom: '10px' }}>
                        <div style={{ display: 'flex' }} >
                            <div style={{ flex: 1, }}>
                                <p style={{ marginLeft: 0 }}>
                                    {i.user_name}
                                </p>
                            </div>
                            <p style={{ marginRight: 10, color: 'darkgrey', fontSize: 14 }}>Max Points: {currAssignData.assignment.max_score}</p>
                            <p style={{ marginRight: 10, color: 'darkgrey', fontSize: 14 }}>Points Given: {i.points_earned ? i.points_earned : 'Not Graded'}</p>
                        </div>
                        <p style={{ marginTop: 10, marginBottom: 5, color: 'darkgrey', fontSize: 14 }}>
                            Attachment
                        </p>
                        <div style={{ border: '1px solid darkgray', padding: 7, cursor: 'pointer', marginTop: 0 }} onClick={() => { handleOpenPdf(i.submission_attachment) }}>
                            <p style={{ fontSize: 16, }}>{i.submission_attachment && i.submission_attachment}</p>
                            <p style={{ fontSize: 16, fontStyle: 'italic' }}>{!i.submission_attachment && "None"}</p>
                        </div>

                        <div>
                            <button onClick={() => { setOpenGrade(true) }} style={{ outline: "none", border: 'none', width: 142, height: 35, backgroundColor: 'green', color: 'white', fontSize: '16px', marginTop: 15, cursor: 'pointer' }}>GRADE</button>
                        </div>
                        <Modal
                            aria-labelledby="transition-modal-title"
                            aria-describedby="transition-modal-description"
                            open={openGrade}
                            onClose={handleCloseGrade}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                outline: 'none',
                                padding: 20,
                            }}

                        >
                            <div style={{ padding: 25, margin: 'auto', backgroundColor: 'white', display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'space-evenly', border: 'none', outline: 'none' }}>
                                <TextField type="number" variant="outlined" label="Grade" value={grade.value} error={grade.error} helperText={grade.helperText} onChange={handleGradeChange} />
                                <button onClick={() => { submitGrade(i.user_id) }} style={{ outline: "none", border: 'none', width: 142, height: 35, backgroundColor: 'green', color: 'white', fontSize: '16px', marginTop: 15, cursor: 'pointer' }}>GRADE</button>
                            </div>
                        </Modal>
                    </div>
                )}
            </div>
        )
    }

    const assignTab = () => {
        return (
            <div style={{ display: 'flex', }}>

                <div style={{ flex: 1 }}>
                    <p style={{ textAlign: 'left', fontSize: 18, fontWeight: 'bold' }}>{currAssignData && currAssignData.assignment.name}</p>
                    <p style={{ fontSize: 14, color: 'darkgray', }}>Due at - {currAssignData && (dueDate)}</p>
                    <p style={{ color: 'darkgray', fontSize: 14, marginTop: 12 }}>Instructions</p>
                    <p style={{ textAlign: 'left', fontSize: 16, }}>{currAssignData && currAssignData.assignment.description}</p>
                    <p style={{ fontSize: 14, marginTop: 12, color: 'darkgray', marginBottom: 3 }}>Reference Material </p>
                    <div onClick={() => { handleOpenPdf(currAssignData.assignment.attachment) }} style={{ border: '1px solid darkgray', padding: 7, cursor: 'pointer' }}>
                        <p style={{ fontSize: 16, }}>{currAssignData && currAssignData.assignment.attachment}</p>
                        <p style={{ fontSize: 16, fontStyle: 'italic' }}>{currAssignData && !currAssignData.assignment.attachment && "None"}</p>
                    </div>
                    <p style={{ fontSize: 14, marginTop: 12, color: 'darkgray' }}>Points </p>
                    <p style={{ fontSize: 16, }}>{currAssignData && currAssignData.assignment.max_score} points possible</p>

                    <p style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 20 }}>Submissions</p>

                    {submission()}

                </div>
                <div onClick={() => { setIsAssignActive(false) }} style={{ cursor: 'pointer' }}>
                    <p style={{ fontSize: 20 }}>X</p>
                </div>
            </div>
        )
    }
    const [isCoding, setIsCoding] = useState(false);
    const handleCheckbox = (e) => {
        setIsCoding(e.target.checked);
    }

    


    const onFileChange1=(e,num)=>{
        // console.log(e.target.files[0],num);
        if(num==1){
            setInput1(e.target.files[0]);
        }
        else if(num==2){
            setInput2(e.target.files[0]);
        }
        else if(num==3){
            setInput3(e.target.files[0]);
        }
        else if(num==4){
            setOutput1(e.target.files[0]);
        }
        else if(num==5){
            setOutput2(e.target.files[0]);
        }
        else if(num==6){
            setOutput3(e.target.files[0]);
        }
    }

    const assignDiv = () => {
        return (
            <React.Fragment>
                <p style={{ fontSize: 24, fontWeight: 'bold', color: 'black', textAlign: 'center', paddingBottom: "2%" }}>Assignment</p>
                <Button variant="contained" onClick={handleOpen} style={{ backgroundColor: "#464775", color: "white", height: "35px", width: 250, margin: 'auto' }}>Create an Assignment</Button>
                {/* <iframe seamless
            src="https://www.engage21.me:9000/media/xxxxx.docx">
            <p>Your browser does not support iframes.</p> </iframe> */}


                <div style={{ padding: "2%", textAlign: "center", fontSize: 28, fontWeight: 'bold', width: '100%' }}>
                    Active Assignments

                    {active()}
                </div>

                <div style={{ padding: "2%", textAlign: "center", fontSize: 28, fontWeight: 'bold', width: '100%' }}>
                    Previous Assignments

                    {past()}
                </div>

                <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    open={open}
                    onClose={handleClose}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                        timeout: 500,
                    }}

                >
                    <Fade in={open} style={{ maxHeight: 700, overflowY: 'auto' }}>
                        <Box sx={style}>
                            <p style={{ textAlign: "center" }}>Create a new Assignment</p>
                            <Box
                                component="form"
                                sx={{
                                    '& > :not(style)': { m: 1 },
                                }}
                                noValidate
                                autoComplete="off"
                            >
                                <TextField
                                    id="outlined-basic"
                                    label="Heading"
                                    variant="outlined"
                                    required
                                    value={heading.value}
                                    error={heading.error}
                                    helperText={heading.helperText}
                                    onChange={handleHeading}

                                />
                                <TextField
                                    id="outlined-textarea"
                                    label="Instructions"
                                    placeholder="Instructions"
                                    multiline
                                    rows={5}
                                    value={instructions.value}
                                    error={instructions.error}
                                    helperText={instructions.helperText}
                                    onChange={handleInstructions}
                                />

                                <div style={{ marginBottom: 20 }}>
                                    <p >Attachment</p>
                                    <div style={{ marginTop: 10 }}>
                                        <div style={{ display: "flex", alignItems: 'center' }}>
                                            <input type="file" onChange={onFileChange} />
                                        </div>
                                        {fileData()}
                                    </div>

                                </div>
                                <TextField
                                    id="datetime-local"
                                    label="Deadline"
                                    type="datetime-local"
                                    variant="outlined"
                                    defaultValue=""
                                    placeholder="YYYY-MM-DD HH:MM"
                                    // onChange={handleTime}
                                    // style={{ width: 300, marginBottom: "4%" }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={deadline.value}
                                    error={deadline.error}
                                    helperText={deadline.helperText}
                                    onChange={handleDeadline}
                                />
                                <TextField
                                    id="outlined-basic"
                                    label="Maximum points"
                                    variant="outlined"
                                    required
                                    value={maxPt.value}
                                    error={maxPt.error}
                                    helperText={maxPt.helperText}
                                    onChange={handleMaxPt}
                                />
                                <div style={{ display: 'flex', alignItems: "center", }}>
                                    <input type="checkbox" id="coding" onChange={handleCheckbox} />
                                    <label style={{ marginLeft: 10 }} for="coding">Is it a coding assignment?</label>
                                </div>
                                {isCoding &&
                                    <div style={{}}>
                                        <div style={{ marginBottom: 20 }}>
                                            <p >Input 1</p>
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ display: "flex", alignItems: 'center' }}>
                                                    <input type="file" onChange={(e)=>{onFileChange1(e,1)}} />
                                                </div>
                                                {/* {fileData()} */}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: 20 }}>
                                            <p >Input 2</p>
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ display: "flex", alignItems: 'center' }}>
                                                    <input type="file" onChange={(e)=>{onFileChange1(e,2)}} />
                                                </div>
                                                {/* {fileData()} */}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: 20 }}>
                                            <p >Input 3</p>
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ display: "flex", alignItems: 'center' }}>
                                                    <input type="file" onChange={(e)=>{onFileChange1(e,3)}} />
                                                </div>
                                                {/* {fileData()} */}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: 20 }}>
                                            <p >Outpur 1</p>
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ display: "flex", alignItems: 'center' }}>
                                                    <input type="file" onChange={(e)=>{onFileChange1(e,4)}} />
                                                </div>
                                                {/* {fileData()} */}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: 20 }}>
                                            <p >Output 2</p>
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ display: "flex", alignItems: 'center' }}>
                                                    <input type="file" onChange={(e)=>{onFileChange1(e,5)}} />
                                                </div>
                                                {/* {fileData()} */}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: 20 }}>
                                            <p >Output 3</p>
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ display: "flex", alignItems: 'center' }}>
                                                    <input type="file" onChange={(e)=>{onFileChange1(e,6)}} />
                                                </div>
                                                {/* {fileData()} */}
                                            </div>
                                        </div>
                                    </div>
                                }

                                <Button onClick={handleCreate} variant="contained" style={{ backgroundColor: "#464775", color: "white", height: "35px" }}>Create Now</Button>
                            </Box>

                        </Box>
                    </Fade>
                </Modal>
            </React.Fragment>
        )
    }

    return (
        <div style={{ padding: 20, display: "flex", flexDirection: "column" }}>
            <Pdf link={link} open={pdfOpen} setOpen={setPdfOpen} />

            {!isAssignActive && assignDiv()}
            {isAssignActive && assignTab()}


        </div>
    )
}
