import moment from 'moment';

export default function *() {

	// Getting current state. Initialize state if state doesn't exist.
	var store = this.getState('Calendar', {
		selectDate: moment(),
		messageDates: []
	});

	this.on('store.Calendar.updateDate', function *(date) {
		var state = this.getState('Calendar');

		var selectDate = moment(date).format('YYYY-MM-DD');

		// Update state
		state.selectDate = selectDate;

		this.dispatch('state.Calendar');
	});

	this.on('store.Calendar.SendMessageDate.query', function *(user, year, month) {
		var state = this.getState('Calendar');

		var year;
		var month;
		if (year || month) {
			year = String(year);
			month = String(month);
		}else {
			year = moment().format('YYYY');
			month = moment().format('MM');
		}

		var conditions = {};
		conditions.disabled = true;
		conditions.memberId = user.id;
		conditions.sendYear = year;
		conditions.sendMonth = month;

		if (user.logined) {
			var res = yield this.request
				.get('/message/creater/list')
				.query({
					q: JSON.stringify(conditions)
				});

			if (res.status != 200) {
				return;
			}

			// Update state
			var messageDates = [];

			if (res.body) {
				for (var index in res.body.messages) {
					var day = moment(res.body.messages[index].sendDate).format('D');
					var isDay = messageDates.indexOf(day);

					if (isDay == '-1') {
						messageDates.push(day);
					}
				}
			}

			state.messageDates = messageDates;
		}

		this.dispatch('state.Calendar');
	});
};
