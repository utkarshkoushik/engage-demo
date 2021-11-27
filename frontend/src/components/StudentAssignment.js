import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../screen/Helper';
// import { Document, Page } from 'react-pdf';
import Button from '@mui/material/Button';
import Pdf from './Pdf';


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
    const token = localStorage.getItem('token');
    const [currA,setCurr] = useState([]);
    const [pastA,setPast] = useState([]);
    const [isAssignActive,setIsAssignActive] = useState(false);
    const [currAssign,setCurrAssign] = useState("");
    const [currAssignData,setCurrAssignData] = useState();
    const [dueDate,setDueDate] = useState();
    const [selectedFile,setSelectedFile] = useState();
    const [alreadyUploaded,setAreadyUploaded] = useState(false);
    const [submissionLink,setSubmissionLink] = useState("");
    const [pdfOpen,setPdfOpen] = useState(false);
    const [link,setLink] = useState("");
    const handlePdfOpen=()=>{
        setPdfOpen(true);
    }
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
    


    

    const handleOpenAssignment=(i)=>{
        console.log(i);
        setIsAssignActive(true);
        setCurrAssign(i.assignment_slug);
    }
    

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

    const assignDiv=()=>{
        return (
            <React.Fragment>
                <div style={{ padding: "2%", textAlign: "center", fontSize: 28, fontWeight: 'bold',width: '100%' }}>
                    Active Assignments

                    {active()}
                </div>

                <div style={{ padding: "2%",textAlign: "center", fontSize: 28, fontWeight: 'bold',width: '100%' }}>
                    Previous Assignments

                    {past()}
                </div>
            </React.Fragment>
        )
    }

    useEffect(()=>{
        if(currAssign!=""){
            axios({
                method: 'post',
                url: api + 'teams/get_assignment',
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
                const date = new Date(res.data.due_at);
                const dateStr = date.getHours() + ":" +  date.getMinutes() + " " + date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
                setDueDate(dateStr);
                if(res.data.msg == "Already submitted"){
                    setAreadyUploaded(true);
                    setSubmissionLink(res.data.attachment);
                }
                else{
                    setAreadyUploaded(false);                    
                }
                
            })
            .catch(err => {
                console.log(err);
            })
        }
    },[currAssign])

    const onFileChange=(e)=>{
        setSelectedFile(e.target.files[0]);
    }

    const fileData=()=>{
        if(selectedFile){
            return (
                <div style={{marginTop: 10}}>
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

    const uploadSubmission=()=>{
        var formData = new FormData();
        formData.append('assignment_slug',currAssign);
        formData.append('attachment',selectedFile);
        axios({
            method: 'post',
            url: api + 'teams/upload_assignment',
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

    const handleOpenPdf=(link)=>{
        setLink(link);
        setPdfOpen(true);
    }

    const assignTab=()=>{
        return (
            <div style={{display: 'flex',}}>
                
                <div style={{flex: 1}}>
                    <p style={{textAlign: 'left', fontSize: 18, fontWeight: 'bold'}}>{currAssignData && currAssignData?.name}</p>
                    <p style={{fontSize: 14, color: 'darkgray',}}>Due at - {currAssignData && (dueDate)}</p>
                    <p style={{color: 'darkgray', fontSize: 14, marginTop: 12}}>Instructions</p>
                    <p style={{textAlign: 'left', fontSize: 16,}}>{currAssignData && currAssignData?.description}</p>
                    <p style={{fontSize: 14, marginTop: 12, color: 'darkgray',marginBottom: 3}}>Reference Material </p>
                    <div onClick={()=>{handleOpenPdf(currAssignData.attachment)}} style={{border: '1px solid darkgray', padding: 7, cursor: 'pointer'}}>
                        <p style={{fontSize: 16,}}>{currAssignData && currAssignData.attachment}</p>
                        <p style={{fontSize: 16,fontStyle: 'italic'}}>{currAssignData && !currAssignData.attachment && "None"}</p>
                    </div>
                    <p style={{fontSize: 14, marginTop: 12, color: 'darkgray'}}>Points </p>
                    <p style={{fontSize: 16,}}>{currAssignData && currAssignData?.max_score} points possible</p>

                {!alreadyUploaded &&
                    <React.Fragment>
                    {currAssignData && new Date().getTime()< currAssignData.due_at &&
                    <p style={{fontSize: 14, marginTop: 32, color: 'darkgray'}}>Upload Work </p>}
                    {currAssignData && new Date().getTime()> currAssignData.due_at &&
                    <p style={{fontSize: 14, marginTop: 32, color: 'darkgray'}}>Your Work </p>}
                    {currAssignData && new Date().getTime()< currAssignData.due_at &&
                        <div style={{marginBottom: 20}}>
                        <div style={{marginTop: 10}}>
                            <div style={{display:"flex", alignItems: 'center'}}>
                                <input type="file" onChange={onFileChange} />
                                {/* <Button onClick={onFileUpload} variant="contained"  style={{backgroundColor:"#464775", color:"white", height:"35px" }}>
                                    Upload!
                                </Button> */}
                            </div>
                            {fileData()}
                            <Button onClick={uploadSubmission} style={{marginTop: 20, backgroundColor: '#464775', width: 140, height: 42, }} variant="contained">Upload</Button>
                        </div>

                    </div>}
                    {currAssignData && new Date().getTime()>= currAssignData.due_at && 
                        <p style={{fontSize: 20,}}>Not Uploaded</p>
                    }
                    </React.Fragment>
                }
                {alreadyUploaded &&
                    <React.Fragment>
                    <p style={{fontSize: 14, marginTop: 32, color: 'darkgray'}}>Your Work</p>
                    <div style={{marginBottom: 20}}>
                        <div onClick={()=>{handleOpenPdf(submissionLink)}} style={{border: '1px solid darkgray', padding: 7, cursor: 'pointer'}}>
                            <p style={{fontSize: 16,}}>{submissionLink}</p>
                            {/* <p style={{fontSize: 16,fontStyle: 'italic'}}>{submissionLink}</p> */}
                        </div>
                    </div>
                    </React.Fragment>
                }
                </div>
                <div onClick={()=>{setIsAssignActive(false)}} style={{cursor: 'pointer'}}>
                    <p style={{fontSize: 20}}>X</p>
                </div>
            </div>
        )
    }
    

    return (
        <div style={{ padding: 20, display: "flex", flexDirection: "column" }}>
            {!isAssignActive && assignDiv()}
            {isAssignActive &&  assignTab()}
            <Pdf link={link} open={pdfOpen} setOpen={setPdfOpen} />
           
        </div>
    )
}
