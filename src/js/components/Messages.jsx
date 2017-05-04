import React from 'react';
import { Link } from 'react-router';
import I18n from 'Extension/I18n.jsx';
import crypto from 'crypto';

import CreateMessage from './CreateMessage.jsx';

// Decorators
import { router, flux, preAction, wait, i18n } from 'Decorator';

var mediaRecorder;
var chunks = [];

@i18n
@flux
class MessagesItem extends React.Component {
	formatDate = (date) => {
		var formatDate = moment(date).format('YYYY-MM-DD');

		return formatDate;
	};

	showVideo = () => {
		$(this.refs.playVideo)
			.modal('show')
		;
	};

	deleteMessage = () => {
		var sendDate = moment(this.props.sendDate).format('YYYY-MM-DD');

		this.flux.dispatch('action.Messages.deleteOne', this.props.messageId, sendDate, this.props.user);
	};

	render() {
		var timeStyle = {
			color: 'gray'
		};

		var playVideo;
		var videoUrl;
		if (this.props.video) {
			playVideo = <i className="video play outline icon" onClick={this.showVideo}></i>;
			videoUrl = '/videos/' + this.props.messageId + '.webm?' + Date.now();
		}

		return (
			<div className="row">
				<div className="column">
					<h5><I18n sign='messages.to'>To</I18n> : {this.props.receiver} <i className="remove icon" onClick={this.deleteMessage}></i></h5>
					<p>{this.props.message}</p>
					{playVideo}
					<p style={timeStyle}>{this.formatDate(this.props.updated)}</p>

					<div className="ui modal" ref="playVideo">
						<div className="header">
							<I18n sign='messages.video.play'>Play Video</I18n>
						</div>
						<div className="image content">
							<div className="description">
								<div className="ui one column centered grid">
									<div className="column">
										<video width="640" height="480" controls>
											<source src={videoUrl} type="video/webm" />
										</video>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
};

@router
@i18n
@flux
@preAction((handle) => {
	var user = handle.props.user;
	handle.doAction('Messages.MessagesWithReceiver.query', user);
})
@wait('Messages')
class Messages extends React.Component {
	constructor(props, context) {
		super(props, context);

		var state = context.flux.getState('Messages');

		this.state = {
			user: props.user,
			selectDate: context.flux.getState('Calendar').selectDate,
			receivers: context.flux.getState('Receivers').receivers || [],
			leaveMessage: null,
			messages: state.messages
		};
	}

	componentWillMount = () => {
		this.flux.on('state.Calendar', this.flux.bindListener(this.onChange));
		this.flux.on('state.Receivers', this.flux.bindListener(this.onChange));
		this.flux.on('state.Messages', this.flux.bindListener(this.onChange));
	};

	componentWillUnmount = () => {
		this.flux.off('state.Calendar', this.onChange);
		this.flux.off('state.Receivers', this.onChange);
		this.flux.off('state.Messages', this.onChange);
	};

	componentDidMount = () => {
		$(this.refs.leaveMessage)
			.transition('hide')
		;

		this.setState({
			leaveMessage: this.leaveMessage
		});
	};

	leaveMessage = () => {
		if (!this.state.user.logined) {
			this.history.pushState(null, '/signin');
			return;
		}

		$(this.refs.leaveMessage)
			.transition('fade down')
		;
	};

	onChange = () => {
		var state = this.flux.getState('Messages');

		this.setState({
			selectDate: this.flux.getState('Calendar').selectDate,
			receivers: this.flux.getState('Receivers').receivers,
			messages: state.messages
		});
	};

	render() {
		var messageListStyle = {
			maxHeight: '600px',
			overflowY: 'scroll'
		};

		var Messages = [];
		for (var index in this.state.messages) {
			var message = this.state.messages[index];

			if (message) {
				Messages.push(
					<MessagesItem
						user={this.props.user}
						messageId={message._id}
						receiver={message.receiverId.displayname}
						message={message.message}
						video={message.video}
						sendDate={message.sendDate}
						updated={message.updated}
						key={index} />
				);
			}
		}

		var createMessage = (
			<Link to='/settings' className='item'>
				<h4>Please Add Receiver</h4>
			</Link>
		);
		if (this.state.receivers.length != 0) {
			createMessage = <CreateMessage receivers={this.state.receivers} user={this.state.user} selectDate={this.state.selectDate} leaveMessage={this.state.leaveMessage} />;
		}

		return (
			<div>
				<div className="ui left aligned basic segment">
					<h1><I18n sign='messages.title'>Messages</I18n> <i className="plus icon" onClick={this.leaveMessage}></i></h1>
					<div className="ui piled segment" ref="leaveMessage">
						{createMessage}
					</div>
				</div>
				<div className="ui left aligned basic segment" ref="messages">
					<div className="ui one column vertically divided grid" style={messageListStyle}>
						{Messages}
					</div>
				</div>
			</div>
		);
	}
};

export default Messages;
