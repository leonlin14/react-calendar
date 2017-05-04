
export default function *() {

	// Getting current state. Initialize state if state doesn't exist.
	var AdminPermission = this.getState('Admin.Permission', {
		availPerms: [],
		groups: {},
		perms: []
	});

	this.on('store.Admin.Permission.getAvailablePermission', function *() {

		var state = this.getState('Admin.Permission');

		// Getting user information by calling API
		var res = yield this.request
			.get('/admin/api/perms')
			.query();

		if (res.status != 200) {
			return;
		}

		// Update state
		state.groups = res.body.groups;
		state.availPerms = res.body.list;

		this.dispatch('state.Admin.Permission');
	});
};
