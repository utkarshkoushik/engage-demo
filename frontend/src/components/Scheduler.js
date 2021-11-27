import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField } from '@material-ui/core';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';



const useStyles = makeStyles((theme) => ({
    pClass: {
        fontSize: 20,
    },
    textField:{
        paddingBottom: 15,
    },
    subHeading:{
        fontSize: 20,
        width: '33%',
        // textAlign: 'center'
    },
    dis:{
        fontSize: 16,
        width: '33%',
    },
    select:{
        width: 110
    },
    
    

}));

export default function Scheduler() {
    const [totalParticipants, setTotalPart] = useState(0);
    const [physicalSeats,setPhysicalSeats] = useState({
        value: 0,
        error: false,
        helperText: ""
    });
    const [parts,setParts] = useState([
        {
            user_id: 1,
            name: 'Utkarsh Koushik',
            preference: 'Online',
            assigned: 0
        },
        {
            user_id: 2,
            name: 'Rishi Shayan',
            preference: 'Physical',
            assigned: 1
        },
        {
            user_id: 3,
            name: 'Rahul Sah',
            preference: 'Physical',
            assigned: 1
        },
        {
            user_id: 4,
            name: 'Shashank Jha',
            preference: 'Online',
            assigned: 0
        },
    ])
    const classes = useStyles();

    useEffect(()=>{

    },[])

    const handlePhysicalSeats=(e)=>{
        setPhysicalSeats({
            value: e.target.value,
            error: false,
            helperText: ""
        })
    }

    const handleChange=(i,e)=>{
        console.log(i,e);
    }

    const distribution=()=>{
        return (
            <div>
            {parts.map(i=>
                <div style={{marginTop: 15, marginLeft: 5, marginRight: 5, display: 'flex', padding: '10px 10px',background: 'lavender',alignItems: 'baseline' }}>
                    <p className={classes.dis} style={{textAlign: 'left'}}>{i.name}</p>
                    <p className={classes.dis} style={{textAlign: 'center'}}>{i.preference}</p>
                    <div style={{display: 'flex', justifyContent: 'flex-end', width: '33%'}}>
                    <Select
                        className={classes.select}
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={i.assigned}
                        // label="Mode"
                        onChange={(e)=>{handleChange(i.user_id,e)}} 
                    >
                        <MenuItem value={0}>Online</MenuItem>
                        <MenuItem value={1}>Physical</MenuItem>
                    </Select>
                    </div>
                    {/* <p className={classes.dis}>{i.assigned}</p> */}
                </div>   
            )}
            </div>
        )
    }
    const handleClass=(e)=>{
        // console.log(e);
    }
    const student=()=>{
        return (
            <div style={{marginTop: 10}}>
                <p style={{fontSize: 20, marginBottom: 15}}>How would you prefer to attend this week's classes?</p>

                <input style={{marginBottom: 10}} type="radio" id="online" name="fav_language" value="0" onClick={()=>{handleClass(0)}} />
                <label for="online" style={{marginLeft: 5}}>Online</label><br></br>
                <input type="radio" id="physical" name="fav_language" value="1" onClick={()=>{handleClass(1)}}/>
                <label for="physical" style={{marginLeft: 5}}>Physical</label><br></br>
            </div>
        )
    }

    return (
        <div style={{padding: 20}}>
            
            <p style={{fontSize: 28, fontWeight: 'bold', textAlign: 'center'}}>Scheduler</p>
            {student()}
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 15, alignItems: 'baseline'}}>
                <p className={classes.pClass}>Total number of participants in team </p>
                <TextField 
                    className={classes.textField}
                    name="physicalSeats"
                    label="Total Members"
                    variant="outlined"
                    InputLabelProps={{ readOnly: true, }}
                    type="number"
                    error={false}
                    value={totalParticipants}
                    style={{  width: "200px" }}
                />
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 15, alignItems: 'baseline'}}>
                <p className={classes.pClass}>Number of physical seats available </p>
                <TextField 
                    className={classes.textField}
                    name="physicalSeats"
                    label="Physical Seats"
                    variant="outlined"
                    InputLabelProps={{ shrink: true, required: true }}
                    type="number"
                    onChange={handlePhysicalSeats}
                    error={physicalSeats.error}
                    value={physicalSeats.value}
                    helperText={physicalSeats.helperText}
                    style={{ paddingBottom: "15", width: "200px" }}
                />
            </div>
            <div style={{marginTop: 15}}>
                <p style={{fontSize: 28, fontWeight: 'bold', textAlign: 'center'}}>Current Distribution</p>
                <div style={{marginTop: 15, marginLeft: 5, marginRight: 5, display: 'flex', }}>
                    <p className={classes.subHeading} style={{textAlign: 'left'}}>Name</p>
                    <p className={classes.subHeading} style={{textAlign: 'center'}}>Preference</p>
                    <p className={classes.subHeading} style={{textAlign: 'right'}}>Assigned</p>
                </div>
                {distribution()}
            </div>

        </div>
    )
}
