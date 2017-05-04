import moment from 'moment';

export default function *() {

	this.on('action.Messages.create', function *(messages, date, user) {
		var state = this.getState('Messages');

		var year = moment(date).format('YYYY');
		var month = moment(date).format('MM');

		var res = yield this.request
			.post('/message/create')
			.send({
				memberId: messages.memberId,
				receiverId: messages._id,
				videoFile: messages.videoFile,
				message: messages.message,
				sendYear: year,
				sendMonth: month,
				sendDate: date
			});

		if (res.status != 200) {
			return;
		}

		var conditions = {};
		conditions.disabled = true;
		conditions.memberId = user.id;
		conditions.sendDate = date;

		var res = yield this.request
			.get('/message/creater/list')
			.query({
				q: JSON.stringify(conditions)
			});

		if (res.status != 200) {
			return;
		}

		// Update state
		state.messages = res.body.messages || [];

		this.dispatch('state.Messages');
	});

	this.on('action.Messages.deleteOne', function *(messageId, date, user) {
		var state = this.getState('Messages');

		// Getting message list by calling API
		var res = yield this.request
			.del('/message/delete/' + messageId)
			.query();

		if (res.status != 200) {
			return;
		}

		var conditions = {};
		conditions.disabled = true;
		conditions.memberId = user.id;
		conditions.sendDate = date;

		var res = yield this.request
			.get('/message/creater/list')
			.query({
				q: JSON.stringify(conditions)
			});

		if (res.status != 200) {
			return;
		}

		// Update state
		state.messages = res.body.messages || [];

		this.dispatch('state.Messages');
	});
};
