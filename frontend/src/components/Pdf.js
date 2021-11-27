import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf/dist/umd/entry.webpack';
import { pdfjs } from 'react-pdf';
import Modal from '@mui/material/Modal';
import { makeStyles } from '@material-ui/core/styles';
import "../css/modal.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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


export default function Pdf(props) {
    const classes = useStyles();
    const [numPages, setNumPages] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    const handleClose=()=>{
        props.setOpen(false);
    }

    const handleBack=()=>{
        if(pageNumber>1){
            setPageNumber(pageNumber-1);
        }
        else{
            setPageNumber(numPages);
        }
    }

    const handleFront=()=>{
        if(pageNumber<numPages){
            setPageNumber(pageNumber+1);
        }
        else{
            setPageNumber(1);
        }
    }

    return (
        <div>
            <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={props.open}
            onClose={handleClose}
        >
            <div className={classes.modalDiv} style={{maxHeight: 500}}>
                <div style={{width: 120,display: 'flex', backgroundColor: 'white', padding: "0px 10px",marginBottom: 10, justifyContent: 'space-between',alignItems: 'center'}}><span onClick={handleBack} style={{fontSize: 35, cursor: 'pointer'}}>{"<"}</span> {pageNumber} / {numPages} <span onClick={handleFront} style={{fontSize: 35, cursor:'pointer'}}>{">"}</span></div>
                <Document
                    options={{
                        cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
                        cMapPacked: true,
                    }}
                    file={"https://localhost:9000" + props.link}
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    <Page pageNumber={pageNumber} />
                </Document>
                
            </div>
        </Modal>
            
        </div>
    )
}
