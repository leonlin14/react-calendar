import React from 'react';
import ReactDOM from 'react-dom';
import I18n from 'Extension/I18n.jsx';

// Decorators
import { flux, preAction, wait, i18n } from 'Decorator';

import moment from 'moment';

class Dotted extends React.Component {
	render() {
		return(
			<svg height="10" width="10">
				<circle cx="5" cy="5" r="4" stroke="none" stroke-width="0" fill="#00BCD4" />
			</svg>
		);
	}
};

class Day extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			today: null
		};
	};

	componentDidMount = () => {
		var today = moment().format('D');

		this.setState({
			today: today
		});
	};

	render() {
		var activeStyle = {
			backgroundColor: '#00BCD4',
			borderRadius: '100%',
			color: 'white'
		};

		var dotted;
		var active;
		if (!this.props.selectedDay) { // default day
			if (this.state.today == this.props.day) {
				active = activeStyle;
			}
		}

		var isDay = this.props.messageDates.indexOf(String(this.props.day));
		if (isDay != '-1') {
			dotted = <Dotted />;
		}

		if (this.props.selectedDay === this.props.day) { // selected day
			active = activeStyle;
		}

		var content;
		if (this.props.day) {
			content = (
				<div className="ui center aligned basic segment day" style={active} onClick={this.props.showMessage.bind(this, this.props.day)}>
					<p>{this.props.day}</p>
					{dotted}
				</div>);
		}

		return(
			<div className="column">
				{content}
			</div>
		);
	}
};

@flux
@preAction((handle) => {
	var user = handle.props.user;
	handle.doAction('Calendar.SendMessageDate.query', user);
})
@wait('Calendar')
class Calendar extends React.Component {
	constructor(props, context) {
		super(props, context);

		var state = context.flux.getState('Calendar');

		this.state = {
			year: null,
			month: null,
			days: [],
			selectedDay: null,
			selectDate: state.selectDate,
			messageDates: state.messageDates
		};
	};

	componentWillMount = () => {
		this.flux.on('state.Calendar', this.flux.bindListener(this.onChange));
	};

	componentWillUnmount = () => {
		this.flux.off('state.Calendar', this.onChange);
	};

	componentDidMount = () => {
		var year = moment().format('YYYY');
		var month = moment().format('MM');

		this.renderDays(year, month);
	};

	onChange = () => {
		var state = this.flux.getState('Calendar');

		this.setState({
			selectDate: state.selectDate,
			messageDates: state.messageDates
		});
	};

	renderDays = (year, month) => {
		var firstDay = moment(year + '-' + month + '-01');
		var preMonth = moment(firstDay).format('d');

		var daysOfMonth = new Date(year, month, 0).getDate(); // save how many days in a month
		var days = [];
		if (preMonth) {
			for (var i=1; i<=preMonth; i++) {
				days.push(null);
			}
		}

		for (var i=1; i<=daysOfMonth; i++) {
			 days.push(i);
		}

		this.setState({
			year: year,
			month: month,
			days: days
		});
	};

	showMessage = (selectedDay) => {
		var day = (selectedDay < 10 ? '0' : '') + selectedDay;
		var date = String(this.state.year) + '-' + String(this.state.month) + '-' + day;

		this.flux.dispatch('action.Calendar.updateDate', date);
		this.flux.dispatch('action.Messages.MessagesWithReceiver.query', this.props.user, date);

		this.setState({
			selectedDay: selectedDay
		});
	};

	formatMonth = (year, month) => {
		if (year && month) {
			var date = moment(year + '-' + month + '-01');
			return moment(date).format('MMMM');
		}

		return null;
	};

	preMonth = () => {
		var year = this.state.year;
		var month = Number(this.state.month) - 1;

		if (month <= 0) {
			month = '12';
		}else {
			month = (month < 10 ? '0' : '') + month;
		}

		this.renderDays(year, month);
		this.flux.dispatch('action.Messages.reset');
		this.flux.dispatch('action.Calendar.SendMessageDate.query', this.props.user, year, month);

		this.setState({
			month: month,
			selectedDay: 'clearDate'
		});
	};

	nextMonth = () => {
		var year = this.state.year;
		var month = Number(this.state.month) + 1;

		if (month >= 13) {
			month = '01';
		}else {
			month = (month < 10 ? '0' : '') + month;
		}

		this.renderDays(year, month);
		this.flux.dispatch('action.Messages.reset');
		this.flux.dispatch('action.Calendar.SendMessageDate.query', this.props.user, year, month);

		this.setState({
			month: month,
			selectedDay: 'clearDate'
		});
	};

	preYear = () => {
		var year = Number(this.state.year) - 1;
		var month = this.state.month;

		this.renderDays(year, month);
		this.flux.dispatch('action.Messages.reset');
		this.flux.dispatch('action.Calendar.SendMessageDate.query', this.props.user, year, month);

		this.setState({
			year: year,
			selectedDay: 'clearDate'
		});
	};

	nextYear = () => {
		var year = Number(this.state.year) + 1;
		var month = this.state.month;

		this.renderDays(year, month);
		this.flux.dispatch('action.Messages.reset');
		this.flux.dispatch('action.Calendar.SendMessageDate.query', this.props.user, year, month);

		this.setState({
			year: year,
			selectedDay: 'clearDate'
		});
	};

	render() {
		var fontRed = {
			color: '#e60000'
		};

		var selectStyle = {
			textAlign: 'center'
		}

		var days = [];
		for (var index in this.state.days) {
			var day = this.state.days[index];
			days.push(<Day
				day={day}
				selectedDay={this.state.selectedDay}
				messageDates={this.state.messageDates}
				showMessage={this.showMessage}
				key={index}
			/>);
		}

		return (
			<div>
				<div className="ui left aligned basic segment">
					<div className="ui grid">
						<div className="thirteen wide column">
							<h1>{this.formatMonth(this.state.year, this.state.month)}</h1>
						</div>
						<div className="three wide column">
							<h2 style={selectStyle}><i className="angle left icon" onClick={this.preMonth}></i><i className="angle right icon" onClick={this.nextMonth}></i></h2>
						</div>
					</div>
					<div className="ui grid">
						<div className="thirteen wide column">
							<h2>{this.state.year}</h2>
						</div>
						<div className="three wide column">
							<h2 style={selectStyle}><i className="angle left icon" onClick={this.preYear}></i><i className="angle right icon" onClick={this.nextYear}></i></h2>
						</div>
					</div>
				</div>
				<div className="ui center aligned basic segment">
					<div className="ui seven column grid">
						<div className="column">
							<div className="ui center aligned basic segment">
								<h3 style={fontRed}><I18n sign='calendar.week.sun'>Sun</I18n></h3>
							</div>
						</div>
						<div className="column">
							<div className="ui center aligned basic segment">
								<h3><I18n sign='calendar.week.mon'>Mon</I18n></h3>
							</div>
						</div>
						<div className="column">
							<div className="ui center aligned basic segment">
								<h3><I18n sign='calendar.week.tue'>Tue</I18n></h3>
							</div>
						</div>
						<div className="column">
							<div className="ui center aligned basic segment">
								<h3><I18n sign='calendar.week.wed'>Wed</I18n></h3>
							</div>
						</div>
						<div className="column">
							<div className="ui center aligned basic segment">
								<h3><I18n sign='calendar.week.thu'>Thu</I18n></h3>
							</div>
						</div>
						<div className="column">
							<div className="ui center aligned basic segment">
								<h3><I18n sign='calendar.week.fri'>Fri</I18n></h3>
							</div>
						</div>
						<div className="column">
							<div className="ui center aligned basic segment">
								<h3 style={fontRed}><I18n sign='calendar.week.sat'>Sat</I18n></h3>
							</div>
						</div>
						{days}
					</div>
				</div>
			</div>
		);
	};
}

export default Calendar;
