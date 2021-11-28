import React,{useState, useEffect} from 'react'
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-solarized_dark";
import { TextField } from '@material-ui/core';
import axios from 'axios';
import { api } from '../screen/Helper';
import "../css/ide.css";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Pdf from './Pdf';
import { useRouteMatch } from 'react-router';
import Modal from '@mui/material/Modal';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({

    modal: {
        display: 'flex',
        padding: theme.spacing(1),
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        outline: 'none'
    },

    modalDiv: {
        margin: 'auto',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: "column",
        alignItems: 'center',
        justifyContent: 'space-evenly',
        border: 'none',
        outline: 'none'
    },

    button: {
        outline: 'none',
        border: 'none',
        height: 36,
        width: 150,
        backgroundColor: '#464775',
        cursor: 'pointer'
    }
}));

export default function Ide(props) {
    const classes = useStyles();
    const defaultCode={
        'JAVA': `import java.util.*;
import java.lang.*;
import java.io.*;

/* Name of the class has to be "Main" only if the class is public. */
class Codechef
{
    public static void main (String[] args) throws java.lang.Exception
    {
        // your code goes here
    }
}
        `,
        'C++':`#include <iostream>
using namespace std;
                        
int main() {
    
    return 0;
}       
        `,
        "PYTHON":`#Start coding`
    }
    const token = localStorage.getItem("token");
    const [stdin,setStdin] = useState("");
    const [stdout,setStdout]= useState("");
    const [language,setLanguage] = useState();
    const [isLoading,setIsLoading] = useState(false);
    const [assign, setAssign] = React.useState(props.assignment_slug);
    const [pdfOpen, setPdfOpen] = useState(false);
    const [link,setLink] =  useState('');
    const [attachment,setAttachment] = useState('');
    const [submissionResult,setSubmissionResult] = useState(false);
    useEffect(()=>{
        setSource(props.code);
    },[props.code])
    
    useEffect(()=>{
        console.log(props.language);
    },[props.language])
    
    
    const [source,setSource] = useState(`#include <iostream>
using namespace std;
                        
int main() {
    
    return 0;
}
                    `);
    const handleStdin=(e)=>{
        setStdin(e.target.value);
    }

    const handleRun=()=>{
        if(isLoading){
            return;
        }
        setIsLoading(true);
        const token = localStorage.getItem('token');
        console.log(language);
        axios({
            method: 'post',
            url: api + 'teams/judge_submission',
            data: {
                source_code: source,
                stdin: stdin,
                language_id: props.language
            },
            headers: {
                Authorization: "Token " + token
            }
        })
            .then(res => {
                setIsLoading(false);
                console.log(res.data);
                if(res.data.output.stdout){
                    setStdout(atob(res.data.output.stdout));
                }
                
            })
            .catch(err => {
                console.log(err);
            })
    }

    function onChange(newValue) {
        // console.log("change", newValue);
        setSource(newValue);
    }


    const handleChangeLanguage=(e)=>{
        // console.log(e);
        setSource(defaultCode[e.target.value]);
        setLanguage(e.target.value)
    }
    const [result,setResult] = useState([]);
    const handleSubmit=()=>{
        if(isLoading){
            return;
        }
        console.log(assign)
        setIsLoading(true);
        setSubmissionResult(false);
        const token = localStorage.getItem('token');
        axios({
            method: 'post',
            url: api + 'teams/judge_testcase',
            data: {
                source_code: source,
                stdin: stdin,
                language_id: props.language,
                assignment_slug : assign
            },
            headers: {
                Authorization: "Token " + token
            }
        })
            .then(res => {
                setSubmissionResult(true);
                setIsLoading(false);
                console.log(res.data);
                console.log(res.data.output.submissions[0].status.description);
                setSubmissionResult(true);
                setResult([res.data.output.submissions[0].status.description,res.data.output.submissions[1].status.description,res.data.output.submissions[2].status.description]);
                if(res.data.output.stdout){
                    setStdout(atob(res.data.output.stdout));
                }
                
            })
            .catch(err => {
                console.log(err);
            })
    }

    const handleOpenPdf = (link) => {
        if (link != "") {
            setPdfOpen(true);
            setLink(link);
        }

    }

    const handleUploadAssignment=()=>{
        if(isLoading){
            return;
        }
        setIsLoading(true);
        const token = localStorage.getItem('token');
        setSubmissionResult(false);
        axios({
            method: 'post',
            url: api + 'teams/judge_testcase',
            data: {
                source_code: source,
                stdin: stdin,
                language_id: language,
                assignment_slug : assign,
                final_submission: true,
            },
            headers: {
                Authorization: "Token " + token
            }
        })
        .then(res => {
            setSubmissionResult(true);
            setIsLoading(false);
            console.log(res.data);
            console.log(res.data.output.submissions[0].status.description);
            setSubmissionResult(true);
            setResult([res.data.output.submissions[0].status.description,res.data.output.submissions[1].status.description,res.data.output.submissions[2].status.description]);
            if(res.data.output.stdout){
                setStdout(atob(res.data.output.stdout));
            }
            
        })
        .catch(err => {
            console.log(err);
        })
    }
    const handleClose=()=>{
        props.setOpen(false);
    }
    const tickSvg = "https://image.shutterstock.com/image-vector/flat-round-check-mark-green-600w-652023034.jpg";
    const crossSvg = "https://freesvg.org/img/TzeenieWheenie_red_green_OK_not_OK_Icons_1.png";
    return (
        <div  >
        <React.Fragment>
        {
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                
                open={props.open}
                onClose={handleClose}
            >
            <div className={classes.modalDiv} style={{backgroundColor: 'white'}}>
            <React.Fragment>
            <div style={{backgroundColor: 'white',overflowY: 'auto', maxHeight: 700}}>
                <p style={{fontSize: 24, fontWeight: 'bold',textAlign: 'center', marginTop: 20, marginBottom: 20}}>IDE</p>
                
                <AceEditor
                    mode="java"
                    theme="solarized_dark"
                    onChange={onChange}
                    value ={source}
                    name="UNIQUE_ID_OF_DIV"
                    height="500px"
                    width="calc(100% - 40px)"
                    fontSize={16}
                    style={{marginLeft: 20,marginRight: 20, marginTop: 0, fontFamily: "Monaco, Menlo, Ubuntu Mono, Droid Sans Mono, Consolas, monospace !important" }}
                />

                <TextField 
                    multiline = {true}
                    rows = {5}
                    onChange = {handleStdin}
                    label={"Input"}
                    value={stdin}
                    variant = "outlined"
                    style={{margin: "20px",width: 500}}
                />
                <br></br>
                <div style={{display: 'flex'}}>
                    <button onClick={handleRun} style={{border:"none", outline: 'none', width: 150, height: 34, backgroundColor: "purple", color: 'white', margin: 20, cursor: 'pointer' }}>
                        {!isLoading?  "Run Code": "Loading..."}
                    </button>
                    {assign && 
                        <React.Fragment>
                            <button onClick={handleSubmit} style={{border:"none", outline: 'none', width: 150, height: 34, backgroundColor: "purple", color: 'white', margin: 20, cursor: 'pointer' }}>
                                {!isLoading?  "Submit": "Loading..."}
                            </button>
                            {/* <button onClick={handleUploadAssignment} style={{border:"none", outline: 'none', width: 150, height: 34, backgroundColor: "purple", color: 'white', margin: 20, cursor: 'pointer' }}>
                                {!isLoading?  "Upload Assignment": "Loading..."}
                            </button>   */}
                        </React.Fragment>
                    }
                </div>
                {stdout &&
                    <div style={{padding: "10px",margin: '10px', border: 'solid 1px grey'}}>
                        <p style={{fontSize: 20, fontWeight: 'bold', marginBottom: 15}}>STDOUT: </p>
                        <TextField 
                            multiline = {true}
                            rows = {5}
                            label="Output"
                            value={stdout}
                            variant = "outlined"
                            style={{margin: "20px",width: 400}}
                        />
                    </div>
                }
                {submissionResult && 
                    <div style={{marginLeft: 20, marginTop: 10}}>
                        <p style={{fontSize: 24, fontWeight: 20, fontWeight: 'bold', marginBottom: 10}}>Result</p>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <div style={{display: 'flex', alignItems: 'center',marginRight: 20}}>
                                <p style={{marginRight: 10, fontWeight: 'bold'}}>Test Case 1 </p>
                                <img src={result[0]=='Accepted' ? tickSvg: crossSvg} style={{width: 20, height: 20}}></img>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center',marginRight: 20,}}>
                                <p style={{marginRight: 10,fontWeight: 'bold'}}>Test Case 2 </p>
                                <img src={result[1]=='Accepted' ? tickSvg: crossSvg} style={{width: 20, height: 20}}></img>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center',marginRight: 20}}>
                                <p style={{marginRight: 10,fontWeight: 'bold'}}>Test Case 3 </p>
                                <img src={result[2]=='Accepted' ? tickSvg: crossSvg} style={{width: 20, height: 20}}></img>
                            </div>
                        </div>    
                    </div>
                }
                <Pdf link={link} open={pdfOpen} setOpen={setPdfOpen} />
                </div>
         </React.Fragment>
        </div>
        </Modal>
    }
    </React.Fragment>
    </div>
    )
}
