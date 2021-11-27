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


export default function Ide(props) {
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
    const [language,setLanguage] = useState("C++");
    const [isLoading,setIsLoading] = useState(false);
    const [assign, setAssign] = React.useState('');
    const [curr,setCurr] = useState([]);
    const [pdfOpen, setPdfOpen] = useState(false);
    const [link,setLink] =  useState('');
    const [attachment,setAttachment] = useState('');
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

    const handleChange = (event,attachment) => {
        setAssign(event.target.value);
        var arr = curr.filter(i=>i.assignment_slug ==event.target.value)
        setAttachment(arr[0].attachment);
    };
    useEffect(()=>{
        
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

    const handleSubmit=()=>{
        if(isLoading){
            return;
        }
        setIsLoading(true);
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

    const handleOpenPdf = (link) => {
        if (link != "") {
            setPdfOpen(true);
            setLink(link);
        }

    }

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
            <div style={{width: '100%', marginLeft: 20,marginTop: 15,marginBottom: 0, backgroundColor: '#002B36',width: 500.219}}>
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
                width="500px"
                fontSize={16}
                // enableBasicAutocompletion={true}
                // enableLiveAutocompletion = {true}
                // enableSnippets={true}
                style={{marginLeft: 20, marginTop: 0, fontFamily: "Monaco, Menlo, Ubuntu Mono, Droid Sans Mono, Consolas, monospace !important" }}
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
            <button onClick={handleSubmit} style={{border:"none", outline: 'none', width: 150, height: 34, backgroundColor: "purple", color: 'white', margin: 20, cursor: 'pointer' }}>
                {!isLoading?  "Submit": "Loading..."}
            </button>
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
            <Pdf link={link} open={pdfOpen} setOpen={setPdfOpen} />
        </div>
    )
}
