import moment from 'moment';

export default function *() {

	// Getting current state. Initialize state if state doesn't exist.
	var store = this.getState('Messages', {
		messages: []
	});

	this.on('store.Messages.MessagesWithReceiver.query', function *(user, date) {
		var state = this.getState('Messages');
		var receivers = this.getState('Receivers');

		if (!user) {
			return;
		}

		var conditions = {};
		conditions.disabled = true;
		conditions.memberId = user.id;

		if (user.logined) {
			var res = yield this.request
				.get('/receiver/list')
				.query({
					q: JSON.stringify(conditions)
				});

			if (res.status != 200) {
				return;
			}

			// Update state
			receivers.receivers = res.body.receivers || [];

			this.dispatch('state.Receivers');

			if (!date) {
				conditions.sendDate = moment().format('YYYY-MM-DD');
			}else {
				conditions.sendDate = date;
			}

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
		}

		this.dispatch('state.Messages');
	});

	this.on('store.Messages.reset', function *() {
		var state = this.getState('Messages');

		state.messages = [];

		this.dispatch('state.Messages');
	});
};
