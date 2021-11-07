import React from 'react'

export default function Assignment() {

    const createAssignment=()=>{



        return(
            <div style={{}}>
                <p style={{fontSize: 24, fontWeight: 'bold', color: 'black'}}>Create Assignment</p>
                
            </div>
        )
    }

    return (
        <div style={{padding: 20}}>
            {/* <iframe seamless
            src="http://127.0.0.1:8000/media/output.pdf">
            <p>Your browser does not support iframes.</p> </iframe> */}
            {createAssignment()}
        </div>
    )
}
