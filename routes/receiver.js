var Router = require('koa-router');

module.exports = function(lApp) {
	var router = new Router();

	var Receiver = lApp.getLibrary('Receiver');

	router.post('/receiver/create', function *() {
		if (!this.request.body.memberId) {
			this.status = 401;
			return;
		}

		// Check whether receiver exists or not
		try {
			var ret = yield Receiver.getReceiverByName(this.request.body.name);

			if (ret) {
				this.status = 409;
				return;
			}
		} catch(e) {
			console.log(e);
			this.status = 500;
			return;
		}

		// Add Receiver
		try {
			var success = yield Receiver.create({
				memberId: this.request.body.memberId,
				name: this.request.body.name,
				displayname: this.request.body.displayname,
				email: this.request.body.email,
				phone: this.request.body.phone,
				address: this.request.body.address
			});
		} catch(e) {
			this.status = 500;
			return;
		}

		this.body = {
			success: true
		};
	});

	router.get('/receiver/list', function *() {
		var q = {};
		try {
			q = JSON.parse(this.request.query.q);
		} catch(e) {}

		var conditions = {};
		if (q.disabled !== undefined) {
			conditions.disabled = q.disabled;
		}
		if (q.memberId !== undefined) {
			conditions.memberId = q.memberId;
		}

		// Fetching a list with specific condition
		var data = yield Receiver.list(conditions, [
			'_id',
			'memberId',
			'name',
			'displayname',
			'email',
			'phone',
			'address',
			'updated'
		]);

		this.body = {
			success: true,
			count: data.count,
			receivers: data.receivers
		};
	});

	return router;
};
