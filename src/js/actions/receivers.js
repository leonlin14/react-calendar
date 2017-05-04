
export default function *() {

	this.on('action.Receivers.create', function *(user, receiver) {
		var state = this.getState('Receivers');

		if (user.logined) {
			var res = yield this.request
				.post('/receiver/create')
				.send({
					memberId: user.id,
					name: receiver.name,
					displayname: receiver.displayname,
					email: receiver.email,
					phone: receiver.phone,
					address: receiver.address
				});

			if (res.status != 200) {
				return;
			}

			var conditions = {};
			conditions.disabled = true;
			conditions.memberId = user.id;

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

			this.dispatch('state.Receivers');
		}
	});
};
