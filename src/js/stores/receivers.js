
export default function *() {

	// Getting current state. Initialize state if state doesn't exist.
	var store = this.getState('Receivers', {
		receivers: []
	});

	this.on('store.Receivers.query', function *(user) {
		var state = this.getState('Receivers');

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
			state.receivers = res.body.receivers || [];
		}

		this.dispatch('state.Receivers');
	});
};
