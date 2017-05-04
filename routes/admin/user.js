var Router = require('koa-router');

module.exports = function(lApp) {

	var router = new Router();

	var Middleware = lApp.getLibrary('Middleware');
	var Permission = lApp.getLibrary('Permission');
	var Member = lApp.getLibrary('Member');

	router.use(Middleware.allow('admin.users'));

	router.get('/admin/api/user/:userid', function *() {

		// Fetching a list with specific condition
		var data = yield Member.getMember(this.params.userid);

		this.body = {
			id: this.params.userid,
			name: data.name,
			email: data.email,
			roles: data.roles || [],
			perms: data.permissions
		};
	});

	router.put('/admin/api/user/:userid/profile', function *() {

		if (!this.request.body.name || !this.request.body.email) {
			this.status = 401;
			return;
		}

		// Save
		try {
			var member = yield Member.save(this.params.userid, {
				name: this.request.body.name,
				email: this.request.body.email
			});
		} catch(e) {
			this.status = 500;
			return;
		}

		var m = {
			name: member.name,
			email: member.email
		};

		this.body = {
			success: true,
			member: m
		};
	});

	router.put('/admin/api/user/:userid/perms', function *() {

		if (!this.request.body.perms || !this.request.body.roles) {
			this.status = 401;
			return;
		}

		// Validate permissions client given
		var isValid = yield Permission.validate(Object.keys(this.request.body.perms));
		if (!isValid) {
			this.status = 401;
			return;
		}

		// Save permissions and roles
		var roles = yield Member.updateRoles(this.params.userid, this.request.body.roles);
		var perms = yield Member.updatePermission(this.params.userid, this.request.body.perms);

		this.body = {
			success: true,
			perms: perms,
			roles: roles
		};
	});

	return router;
};
