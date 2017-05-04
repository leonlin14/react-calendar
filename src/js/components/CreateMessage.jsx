import React from 'react';
import { Link } from 'react-router';
import I18n from 'Extension/I18n.jsx';

import crypto from 'crypto';
import moment from 'moment';

// Decorators
import { router, flux, i18n } from 'Decorator';

var mediaRecorder;
var chunks = [];

@router
@i18n
@flux
class CreateMessage extends React.Component {
	constructor(props, context) {
		super(props, context);

		var state = context.flux.getState('Messages');

		this.state = {
			constraints: null,
			videoFile: null
		};
	}

	componentDidMount = () => {
		if(this.getBrowser() == "Chrome"){
			this.setState({
				constraints: {"audio": true, "video": {  "mandatory": {  "minWidth": 640,  "maxWidth": 640, "minHeight": 480,"maxHeight": 480 }, "optional": [] } }
			});
		}else if(this.getBrowser() == "Firefox"){
			this.setState({
				constraints: {audio: true,video: {  width: { min: 640, ideal: 640, max: 1280 },  height: { min: 480, ideal: 480, max: 720 }}}
			});
		}

		this.refs.video.controls = false;
	};

	getBrowser = () => {
		var nVer = navigator.appVersion;
		var nAgt = navigator.userAgent;
		var browserName  = navigator.appName;
		var fullVersion  = ''+parseFloat(navigator.appVersion);
		var majorVersion = parseInt(navigator.appVersion,10);
		var nameOffset,verOffset,ix;

		// In Opera, the true version is after "Opera" or after "Version"
		if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
		 browserName = "Opera";
		 fullVersion = nAgt.substring(verOffset+6);
		 if ((verOffset=nAgt.indexOf("Version"))!=-1)
		   fullVersion = nAgt.substring(verOffset+8);
		}
		// In MSIE, the true version is after "MSIE" in userAgent
		else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
		 browserName = "Microsoft Internet Explorer";
		 fullVersion = nAgt.substring(verOffset+5);
		}
		// In Chrome, the true version is after "Chrome"
		else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
		 browserName = "Chrome";
		 fullVersion = nAgt.substring(verOffset+7);
		}
		// In Safari, the true version is after "Safari" or after "Version"
		else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
		 browserName = "Safari";
		 fullVersion = nAgt.substring(verOffset+7);
		 if ((verOffset=nAgt.indexOf("Version"))!=-1)
		   fullVersion = nAgt.substring(verOffset+8);
		}
		// In Firefox, the true version is after "Firefox"
		else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
		 browserName = "Firefox";
		 fullVersion = nAgt.substring(verOffset+8);
		}
		// In most other browsers, "name/version" is at the end of userAgent
		else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) <
			   (verOffset=nAgt.lastIndexOf('/')) )
		{
		 browserName = nAgt.substring(nameOffset,verOffset);
		 fullVersion = nAgt.substring(verOffset+1);
		 if (browserName.toLowerCase()==browserName.toUpperCase()) {
		  browserName = navigator.appName;
		 }
		}
		// trim the fullVersion string at semicolon/space if present
		if ((ix=fullVersion.indexOf(";"))!=-1)
		   fullVersion=fullVersion.substring(0,ix);
		if ((ix=fullVersion.indexOf(" "))!=-1)
		   fullVersion=fullVersion.substring(0,ix);

		majorVersion = parseInt(''+fullVersion,10);
		if (isNaN(majorVersion)) {
		 fullVersion  = ''+parseFloat(navigator.appVersion);
		 majorVersion = parseInt(navigator.appVersion,10);
		}

		return browserName;
	};

	submitMessage = () => {
		var receiver = {};
		receiver = this.props.receivers[this.refs.receiver.value];
		receiver.message = this.refs.message.value;
		receiver.videoFile = this.state.videoFile;

		var selectDate = moment(this.props.selectDate).format('YYYY-MM-DD');

		this.flux.dispatch('action.Messages.create', receiver, selectDate, this.props.user);
		this.props.leaveMessage();
	};

	showCamera = () => {
		$(this.refs.camera)
			.modal('show')
		;
	};

	recordVideo = () => {
		navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

		if (typeof MediaRecorder === 'undefined' || !navigator.getMedia) {
			alert('MediaRecorder not supported on your browser, use Firefox 30 or Chrome 49 instead.');
		}else {
			navigator.getMedia(
			this.state.constraints,
			(stream) => {
				console.log('Start recording...');
				var self = this;

				if (typeof MediaRecorder.isTypeSupported == 'function'){
					if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
					  var options = {mimeType: 'video/webm;codecs=vp9'};
					} else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
					  var options = {mimeType: 'video/webm;codecs=vp8'};
					}
					mediaRecorder = new MediaRecorder(stream, options);
				}else{
					mediaRecorder = new MediaRecorder(stream);
				}

				mediaRecorder.start(10);

				var url = window.URL || window.webkitURL;
				this.refs.video.src = url ? url.createObjectURL(stream) : stream;
				this.refs.video.play();

				mediaRecorder.ondataavailable = function(e) {
					chunks.push(e.data);
				};

				mediaRecorder.onerror = function(e){
					console.log('Error: ', e);
				};


				mediaRecorder.onstart = function(){
					console.log('Started & state = ' + mediaRecorder.state);
				};

				mediaRecorder.onstop = function(){
					console.log('Stopped  & state = ' + mediaRecorder.state);

					var blob = new Blob(chunks, {type: "video/webm"});
					chunks = [];

					var videoUrl = window.URL.createObjectURL(blob);

					self.refs.video.src = videoUrl;

					var reader = new FileReader();
					reader.onload = function(e) {
						var arrayBuffer = reader.result;
						var string = new Buffer(arrayBuffer, 'binary').toString('base64');

						self.setState({
							videoFile: string
						});
					}

					reader.readAsArrayBuffer(blob);

					// var rand = crypto.randomBytes(32).toString('base64').substr(0, 8);
					// var filename = rand + ".webm" ;

			        // var tempLink = document.createElement('a');
			        // tempLink.href = csvURL;
			        // tempLink.setAttribute('download', filename);
			        // tempLink.click();
				};

				mediaRecorder.onpause = function(){
					console.log('Paused & state = ' + mediaRecorder.state);
				};

				mediaRecorder.onresume = function(){
					console.log('Resumed  & state = ' + mediaRecorder.state);
				};

				mediaRecorder.onwarning = function(e){
					console.log('Warning: ' + e);
				};
			}, (error) => {
				console.log("Video capture error: ", error.code);
			});
		}
	};

	stopVideo = () => {
		mediaRecorder.stop();
		this.refs.video.controls = true;
	};

	render() {
		var videoStyle = {
			background: '#222',
			width: '640px',
			height: '480px'
		};

		var receiverOptions = [];
		if (this.props.receivers.length != 0) {
			for (var index in this.props.receivers) {
				var receiver = this.props.receivers[index];
				receiverOptions.push(
					<option value={index} key={index}>{receiver.displayname}</option>
				);
			}
		}

		return (
			<div>
				<div className="ui form">
					<div className="inline field">
						<label><I18n sign='messages.to'>To</I18n> :</label>
						<select ref="receiver" name="receiver" className="ui fluid selection dropdown">
							{receiverOptions}
						</select>
						<Link to='/settings/receivers' className="add-reciver-icon">
							<i className='add user icon'></i>
						</Link>
					</div>
					<i className="material-icons video" onClick={this.showCamera}>video_call</i>
					<div className="field">
						<label><I18n sign='messages.subtitle'>Your Message</I18n> : </label>
						<textarea ref="message" rows="7"></textarea>
					</div>
					<button className="small ui linkedin icon button" onClick={this.submitMessage}>
						<I18n sign='messages.submit'>Submit</I18n>
					</button>
					<button className="small ui button" onClick={this.props.leaveMessage}>
						<I18n sign='messages.close'>Close</I18n>
					</button>
				</div>

				<div className="ui modal" ref="camera">
					<div className="header">
						<I18n sign='messages.video.snap'>Snap Video</I18n>
					</div>
					<div className="image content">
						<div className="description">
							<div className="ui one column centered grid">
								<div className="column">
									<video ref="video" style={videoStyle} controls autoplay></video>
									<br /><br />
									<button ref="button" className="small ui linkedin icon button" onClick={this.recordVideo}>
										<I18n sign='messages.video.rec'>Rec</I18n>
									</button>
									<button ref="button" className="small ui icon button" onClick={this.stopVideo}>
										<I18n sign='messages.video.stop'>Stop</I18n>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
};

export default CreateMessage;
