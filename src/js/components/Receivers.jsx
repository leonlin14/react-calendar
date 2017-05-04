import React from 'react';

import I18n from 'Extension/I18n.jsx';

// Decorators
import { router, flux, i18n, preAction, wait } from 'Decorator';

import moment from 'moment';

class ReceiverItem extends React.Component {
	formatDate = (date) => {
		var formatDate = moment(date).format('YYYY-MM-DD');

		return formatDate;
	};

	render() {
		return (
			<tr>
				<td>{this.props.displayname}</td>
				<td>{this.props.email}</td>
				<td>{this.props.phone}</td>
				<td>{this.props.address}</td>
				<td>{this.formatDate(this.props.updated)}</td>
			</tr>
		);
	}
}

@i18n
@flux
@preAction((handle) => {
	var user = handle.flux.getState('User');
	handle.doAction('Receivers.query', user);
})
@wait('Receivers')
class Receivers extends React.Component {
	constructor(props, context) {
		super(props, context);

		var state = this.flux.getState('Receivers');

		this.state = {
			user: context.flux.getState('User'),
			receivers: state.receivers
		};
	}

	componentWillMount = () => {
		this.flux.on('state.User', this.flux.bindListener(this.onChange));
		this.flux.on('state.Receivers', this.flux.bindListener(this.onChange));
	};

	componentWillUnmount = () => {
		this.flux.off('state.User', this.onChange);
		this.flux.off('state.Receivers', this.onChange);
	};

	componentDidMount = () => {
		$(this.refs.addReceiver)
			.transition('hide')
		;
	};

	onChange = () => {
		var state = this.flux.getState('Receivers');

		this.setState({
			user: this.flux.getState('User'),
			receivers: state.receivers
		});
	};

	addReceiver = () => {
		$(this.refs.addReceiver)
			.transition('fade down')
		;
	};

	saveReceiver = () => {
		var name = this.refs.name.value;
		var displayname = this.refs.displayname.value;
		var email = this.refs.email.value;
		var phone = this.refs.phone.value;
		var address = this.refs.address.value;

		if (!name || !displayname) {
			return;
		}

		var receiver = {};

		receiver.name = name;
		receiver.displayname = displayname;
		receiver.email = email;
		receiver.phone = phone;
		receiver.address = address;

		this.flux.dispatch('action.Receivers.create', this.state.user, receiver);

		this.addReceiver();
	};

	render() {
		var receivers = [];
		for (var index in this.state.receivers) {
			var receiver = this.state.receivers[index];
			receivers.push(
				<ReceiverItem
					id={receiver._id}
					displayname={receiver.displayname}
					email={receiver.email}
					phone={receiver.phone}
					address={receiver.address}
					updated={receiver.updated}
					key={index} />
			);
		}

		return (
			<div className='ui padded basic segment'>
				<div className='ui form'>
					<h1 className='ui header'>
						<div className='content'>
							<I18n sign='receiver.list'>Receiver list</I18n>
							<div className='sub header'>
								<I18n sign='receiver.subtitle'>Who will receiver you future messages</I18n>
							</div>
						</div>
					</h1>
				</div>
				<br />
				<button className="ui teal button" onClick={this.addReceiver}><I18n sign='receiver.add'>Add Receiver</I18n></button>
				<div className="ui piled segment" ref="addReceiver">
					<div className="ui form">
						<div className="four fields">
							<div className="required field">
								<label><I18n sign='receiver.label.name'>Name</I18n></label>
								<input type="text" ref="name" placeholder="Leon Lin" />
							</div>
							<div className="required field">
								<label><I18n sign='receiver.label.displayname'>Display Name</I18n></label>
								<input type="text" ref="displayname" placeholder="Leon" />
							</div>
							<div className="field">
								<label><I18n sign='receiver.label.email'>Email</I18n></label>
								<input type="text" ref="email" placeholder="leon@calendar.com" />
							</div>
							<div className="field">
								<label><I18n sign='receiver.label.phone'>Phone Number</I18n></label>
								<input type="text" ref="phone" placeholder="0912453679" />
							</div>
						</div>
						<div className="field">
							<div className="field">
								<label><I18n sign='receiver.label.address'>Address</I18n></label>
								<input type="text" ref="address" placeholder="台北市大安區信義路三段120號" />
							</div>
						</div>

						<button className="small ui teal button" onClick={this.saveReceiver}>
							<I18n sign='receiver.submit'>Submit</I18n>
						</button>
						<button className="small ui button" onClick={this.addReceiver}>
							<I18n sign='receiver.close'>Close</I18n>
						</button>
					</div>
				</div>

				<table className='ui basic padded table'>
					<thead>
						<tr>
							<th className='two wide'><I18n sign='receiver.label.name'>Name</I18n></th>
							<th className='two wide'><I18n sign='receiver.label.email'>E-mail</I18n></th>
							<th className='two wide'><I18n sign='receiver.label.phone'>Phone</I18n></th>
							<th className='three wide'><I18n sign='receiver.label.address'>Address</I18n></th>
							<th className='two wide'><I18n sign='receiver.label.update'>Update</I18n></th>
						</tr>
					</thead>
					<tbody>
						{receivers}
					</tbody>
				</table>

				<div className={'ui attached negative message ' + (receivers.length ? 'hidden' : '')}>
					<I18n sign='receiver.norecevier'>No Receiver</I18n>
				</div>

			</div>
		);
	}
}

export default Receivers;
