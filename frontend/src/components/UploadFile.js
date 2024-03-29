import axios from 'axios';
import Button from '@material-ui/core/Button';

import React,{Component} from 'react';

class App extends Component {

	state = {

	// Initially, no file is selected
	selectedFile: null
	};
	
	// On file select (from the pop up)
	onFileChange = event => {
	
	// Update the state
	this.setState({ selectedFile: event.target.files[0] });
	
	};
	
	// On file upload (click the upload button)
	onFileUpload = () => {
	
	// Create an object of formData
	const formData = new FormData();
	
	// Update the formData object
	formData.append(
		"myFile",
		this.state.selectedFile,
		this.state.selectedFile.name
	);
	
	// Details of the uploaded file
	console.log(this.state.selectedFile);
	
	// Request made to the backend api
	// Send formData object
	axios.post("api/uploadfile", formData);
	};
	
	// File content to be displayed after
	// file upload is complete
	fileData = () => {
	
	if (this.state.selectedFile) {
		
		return (
		<div>
			<p>File Name: {this.state.selectedFile.name}</p>
		</div>
		);
	} else {
		return (
            <div></div>
		);
	}
	};
	
	render() {
	
	return (
		<div>
			<div style={{display:"flex"}}>
				<input type="file" onChange={this.onFileChange} />
				<Button onClick={this.onFileUpload} variant="contained"  style={{backgroundColor:"#464775", color:"white", height:"35px" }}>
				Upload!
				</Button>
			</div>
		{this.fileData()}
		</div>
	);
	}
}

export default App;
