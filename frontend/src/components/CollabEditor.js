import React,{useState, useEffect} from 'react'
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-solarized_dark";
import { TextField } from '@material-ui/core';
import axios from 'axios';
import { api, socketUrl } from '../screen/Helper';
import "../css/ide.css";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Pdf from './Pdf';
import { io } from "socket.io-client";


export default function Ide(props) {
    const socket = io(socketUrl);
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
    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }
       return result;
    }
    var thread_id;
    if(!window.location.href.split("#")[2]){
        thread_id = makeid(10);
    }
    else{
        thread_id = window.location.href.split("#")[2];
    }
    thread_id = "hl2gLOnK2q"
    
    const token = localStorage.getItem("token");
    const [stdin,setStdin] = useState("");
    const [stdout,setStdout]= useState("");
    const [language,setLanguage] = useState("C++");
    const [isLoading,setIsLoading] = useState(false);
    const [assign, setAssign] = React.useState('');
    const [curr,setCurr] = useState([]);
    const [pdfOpen, setPdfOpen] = useState(false);
    const [link,setLink] =  useState('');
    const [attachment,setAttachment] = useState('');
    const [submissionResult,setSubmissionResult] = useState(false);

    const [user,setUser] = useState('');
    const [reqUser,setReqUser] = useState('');
    useEffect(()=>{
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
            
            setCurr(res.data.active_assign.filter(i=>i.is_assignment_auto_judge==true));
            // setPast(res.data.past_assign);
        })
        .catch(err => {
            console.log(err);
        })
    },[])

    useEffect(()=>{
        axios({
            method: 'post',
            url: api + 'teams/get_email',
            headers: {
                Authorization: "Token " + token
            }
        })
        .then(res => {
            setUser(res.data.email);
        })
        .catch(err => {
            console.log(err);
        })
    },[])

    
    
    const handleChange = (event,attachment) => {
        setAssign(event.target.value);
        
        var arr = curr.filter(i=>i.assignment_slug ==event.target.value);
        socket.emit('update_assignment',thread_id,event.target.value,arr[0].attachment);
        setAttachment(arr[0].attachment);
    };
    useEffect(()=>{
        
        socket.on('connect', function () {
            socket.emit('uuid', thread_id);
        });
        socket.on('updateRunCode', function (data) {
            // console.log(data, name);
            setStdout(atob(data));
            setIsLoading(false);
        })
        socket.on('updateSubmitCode', function (data) {
            // console.log(data, name);
            setResult(data);
            setIsLoading(false);
            setSubmissionResult(true);
            
        })
        socket.on('updateUpdateCode', function (data,user) {
            // console.log(data, name);
            setSource(data);
        })
        socket.on('updateLoading', function () {
            setIsLoading(true);
        })
        socket.on('updateAssignment', function (data,attachment) {
            setAssign(data);
            setAttachment(attachment)
        })
        
        return () => {
            socket.disconnect();
        }
    },[])
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
        socket.emit('loading',thread_id);
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
                language_id: language
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
                    socket.emit('run_code',thread_id,res.data.output.stdout);
                }
                
            })
            .catch(err => {
                console.log(err);
            })
    }

    function onChange(newValue) {
        // console.log("change", newValue);
        socket.emit('update_code',thread_id, newValue,user);
        setSource(newValue);
    }


    const handleChangeLanguage=(e)=>{
        // console.log(e);
        setSource(defaultCode[e.target.value]);
        setLanguage(e.target.value)
    }
    const [result,setResult] = useState([]);
    const handleSubmit=()=>{
        socket.emit('loading',thread_id);
        if(user!=reqUser){
            socket.emit('submit_code',thread_id,user);
        }
        if(isLoading){
            
            return;
        }
        setIsLoading(true);
        setSubmissionResult(false);
        const token = localStorage.getItem('token');
        axios({
            method: 'post',
            url: api + 'teams/judge_testcase',
            data: {
                source_code: source,
                stdin: stdin,
                language_id: language,
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
                socket.emit('submit_code',thread_id,[res.data.output.submissions[0].status.description,res.data.output.submissions[1].status.description,res.data.output.submissions[2].status.description]);
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

    const tickSvg = "https://image.shutterstock.com/image-vector/flat-round-check-mark-green-600w-652023034.jpg";
    const crossSvg = "https://freesvg.org/img/TzeenieWheenie_red_green_OK_not_OK_Icons_1.png";
    return (
        <div>
            <p style={{fontSize: 24, fontWeight: 'bold',textAlign: 'center', marginTop: 20}}>IDE</p>
            <div style={{width: '100%', display: 'flex',marginTop: 15,marginBottom: 10}}>
            <FormControl style={{width: 500, margin: 'auto'}}>
                <InputLabel id="demo-simple-select-label">Select Assignment</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={assign}
                    label="Select Assignment"
                    onChange={(e)=>{handleChange(e)}}
                >
                    {curr.map(i=>
                        <MenuItem value={i.assignment_slug}>{i.name}</MenuItem>
                    )}
                </Select>
            </FormControl>
            </div>
            { assign &&            
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <div style={{ border: '1px solid darkgray', padding: 7, cursor: 'pointer', marginTop: 0 }} onClick={() => { handleOpenPdf(attachment) }}>
                        <p style={{ fontSize: 16, }}>{attachment && attachment}</p>
                        <p style={{ fontSize: 16, fontStyle: 'italic' }}>{!attachment && "None"}</p>
                    </div>
                </div>
            }
            <div style={{ marginLeft:20, marginRight: 20,marginTop: 15,marginBottom: 0, backgroundColor: '#002B36',width: "calc(100% - 40px)"}}>
            <select style={{outline: 'none',width: 100, height: 30, color: 'white',backgroundColor: '#002B36'}} id="cars" name="cars"  value={language} onChange={handleChangeLanguage}>
                <option value="C++">C++</option>
                <option value="JAVA">JAVA</option>
                <option value="PYTHON">PYTHON</option>
            </select>
            {/* <FormControl style={{width: 200,}}>
                <InputLabel id="demo-simple-select-label">Select Language</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={language}
                    label="Select Assignment"
                    onChange={handleChangeLanguage}
                >
                    
                    <MenuItem value={52}>C++</MenuItem>
                    <MenuItem value={53}>JAVA</MenuItem>
                    <MenuItem value={54}>PYTHON</MenuItem>
                    
                </Select>
            </FormControl> */}
            </div>
            <AceEditor
                mode="java"
                theme="solarized_dark"
                onChange={onChange}
                value ={source}
                name="UNIQUE_ID_OF_DIV"
                height="500px"
                width="calc(100% - 40px)"
                fontSize={16}
                // enableBasicAutocompletion={true}
                // enableLiveAutocompletion = {true}
                // enableSnippets={true}
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
                        <button onClick={handleUploadAssignment} style={{border:"none", outline: 'none', width: 150, height: 34, backgroundColor: "purple", color: 'white', margin: 20, cursor: 'pointer' }}>
                            {!isLoading?  "Upload Assignment": "Loading..."}
                        </button>  
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
    )
}
