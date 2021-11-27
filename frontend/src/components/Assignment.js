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
    const [currA,setCurr] = useState([]);
    const [pastA,setPast] = useState([]);
    const [selectedFile,setSelectedFile] = useState();

    const [isAssignActive,setIsAssignActive] = useState(false);
    const [currAssign,setCurrAssign] = useState("");
    const [currAssignData,setCurrAssignData] = useState();
    const [dueDate,setDueDate] = useState();
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

    const [link,setLink] = useState("");


    const handleHeading = (e)=>{
        setHeading({
            value: e.target.value,
            error: false,
            helperText: ""
        })
        
    }

    const handleInstructions = (e)=>{
        setInstructions({
            value: e.target.value,
            error: false,
            helperText: ""
        })
    }

    const handleDeadline = (e)=>{
        console.log(e.target.value);
        setDeadline({
            value: e.target.value,
            error: false,
            helperText: ""
        })
    }

    const handleAttachment= (e)=>{
        setAttachment({
            value: e.target.value,
            error: false,
            helperText: ""
        })
    }

    const handleMaxPt = (e)=>{
        setMaxPt({
            value: e.target.value,
            error: false,
            helperText: ""
        })
    }
    const handleCreate=()=>{
        if(heading.value==""){
            setHeading({
                value: "",
                error:true,
                helperText: "Heading cannot be left blank"
            })
        }
        if(deadline.value==""){
            setDeadline({
                value: "",
                error:true,
                helperText: "Deadline cannot be left blank"
            })
        }
        if(maxPt.value==""){
            setMaxPt({
                value: "",
                error:true,
                helperText: "Maximum Points cannot be left blank"
            })
        }
        if(maxPt.value!="" && deadline.value!="" && heading.value!=""){
            
            const formData = new FormData();
            const deadlineSec =  new Date(deadline.value);
            formData.append("team_slug", props.team_slug);
            formData.append("name", heading.value);
            formData.append("due_at", deadlineSec.getTime());
            formData.append("closes_at", deadlineSec.getTime());
            formData.append("description", instructions.value);
            formData.append("max_score", maxPt.value);
            formData.append("attachment", selectedFile);
            
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

    const handleOpenAssignment=(i)=>{
        console.log(i);
        setIsAssignActive(true);
        setCurrAssign(i.assignment_slug);
    }

    const handleOpenPdf=(link)=>{
        if(link!=""){
            setPdfOpen(true);
            setLink(link);
        }
        
    }

    useEffect(()=>{
        if(currAssign!=""){
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
                const dateStr = date.getHours() + ":" +  date.getMinutes() + " " + date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
                setDueDate(dateStr);
                
            })
            .catch(err => {
                console.log(err);
            })
        }
    },[currAssign])
    

    const assignCard=(assign)=>{
        const docs = [
            {uri: "https://www.engage21.me:9000" + assign.attachment}
        ]
        return (
            <div onClick={()=>handleOpenAssignment(assign)} style={{backgroundColor: 'darkgray', marginTop: 20, padding: 20, cursor: 'pointer'}}>
                <p style={{fontSize: 16, fontWeight: 'normal', textAlign: 'left'}}>
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

    const past=()=>{
        if(pastA.length==0){
            return(
                <p style={{textAlign: 'center', fontSize: 20, fontWeight: 'normal'}}>
                    No previous assignments.
                </p>
            )
        }
        return(
            
            pastA.map(i=>assignCard(i))
        )
    }

    const active=()=>{
        if(currA.length==0){
            return(
                <p style={{textAlign: 'center', fontSize: 20, fontWeight: 'normal'}}>
                    No active assignments.
                </p>
            )
        }
        return(
            currA.map(i=>assignCard(i))
        )
    }

    const onFileUpload=()=>{

    }

    const onFileChange=(e)=>{
        setSelectedFile(e.target.files[0]);
    }

    const fileData=()=>{
        if(selectedFile){
            return (
                <div>
                    <p>File Name: {selectedFile.name}</p>
                </div>
            );
        }
        else{
            return(
                <div></div>
            )
        }
    }
    const [pdfOpen,setPdfOpen] = useState(false);
    // const handlePdfOpen=()=>{
    //     setPdfOpen(true);
    // }
    const submission=()=>{
        return(
            <div>
                {currAssignData && currAssignData.submissions.map(i=>
                    <div style={{backgroundColor: 'white', padding: 10, border: '1px solid grey', marginBottom: '10px'}}>
                        <p style={{marginLeft: 0}}>
                            {i.user_name}
                        </p>
                        <p style={{marginTop: 10, marginBottom: 5, color: 'darkgrey', fontSize: 14}}>
                            Attachment
                        </p>
                        <div style={{border: '1px solid darkgray', padding: 7, cursor: 'pointer', marginTop: 0}} onClick={()=>{handleOpenPdf(i.submission_attachment)}}>
                            <p style={{fontSize: 16,}}>{i.submission_attachment && i.submission_attachment}</p>
                            <p style={{fontSize: 16,fontStyle: 'italic'}}>{!i.submission_attachment && "None"}</p>
                        </div>
                    </div>    
                )}
            </div>
        )
    }

    const assignTab=()=>{
        return (
            <div style={{display: 'flex',}}>
                
                <div style={{flex: 1}}>
                    <p style={{textAlign: 'left', fontSize: 18, fontWeight: 'bold'}}>{currAssignData && currAssignData.assignment.name}</p>
                    <p style={{fontSize: 14, color: 'darkgray',}}>Due at - {currAssignData && (dueDate)}</p>
                    <p style={{color: 'darkgray', fontSize: 14, marginTop: 12}}>Instructions</p>
                    <p style={{textAlign: 'left', fontSize: 16,}}>{currAssignData && currAssignData.assignment.description}</p>
                    <p style={{fontSize: 14, marginTop: 12, color: 'darkgray',marginBottom: 3}}>Reference Material </p>
                    <div onClick={()=>{handleOpenPdf(currAssignData.assignment.attachment)}} style={{border: '1px solid darkgray', padding: 7, cursor: 'pointer'}}>
                        <p style={{fontSize: 16,}}>{currAssignData && currAssignData.assignment.attachment}</p>
                        <p style={{fontSize: 16,fontStyle: 'italic'}}>{currAssignData && !currAssignData.assignment.attachment && "None"}</p>
                    </div>
                    <p style={{fontSize: 14, marginTop: 12, color: 'darkgray'}}>Points </p>
                    <p style={{fontSize: 16,}}>{currAssignData && currAssignData.assignment.max_score} points possible</p>
                    
                    <p style={{fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 20}}>Submissions</p>

                    {submission()}
                    
                </div>
                <div onClick={()=>{setIsAssignActive(false)}} style={{cursor: 'pointer'}}>
                    <p style={{fontSize: 20}}>X</p>
                </div>
            </div>
        )
    }

    const assignDiv=()=>{
        return (
            <React.Fragment>
                <p style={{ fontSize: 24, fontWeight: 'bold', color: 'black', textAlign: 'center', paddingBottom: "2%" }}>Assignment</p>
            <Button variant="contained" onClick={handleOpen} style={{ backgroundColor: "#464775", color: "white", height: "35px", width: 250, margin:'auto' }}>Create an Assignment</Button>
            {/* <iframe seamless
            src="https://www.engage21.me:9000/media/xxxxx.docx">
            <p>Your browser does not support iframes.</p> </iframe> */}


            <div style={{ padding: "2%", textAlign: "center", fontSize: 28, fontWeight: 'bold',width: '100%' }}>
                Active Assignments

                {active()}
            </div>

            <div style={{ padding: "2%",textAlign: "center", fontSize: 28, fontWeight: 'bold',width: '100%' }}>
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
                <Fade in={open}>
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
                                onChange = {handleHeading}

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
                                onChange = {handleInstructions}
                            />
                            
                            <div style={{marginBottom: 20}}>
                                <p >Attachment</p>
                                <div style={{marginTop: 10}}>
                                    <div style={{display:"flex", alignItems: 'center'}}>
                                        <input type="file" onChange={onFileChange} />
                                        {/* <Button onClick={onFileUpload} variant="contained"  style={{backgroundColor:"#464775", color:"white", height:"35px" }}>
                                            Upload!
                                        </Button> */}
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
                                onChange = {handleDeadline}
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
            {isAssignActive &&  assignTab()}
            

        </div>
    )
}
