var co = require('co');

module.exports = function(lApp) {

	var settings = lApp.settings;
	var Permission;
	var Receiver;

	return {
		onload: function(lApp) {
			return function(done) {

				// Libraries
				Permission = lApp.getLibrary('Permission');
				Receiver = lApp.getModel('Receiver');

				done();
			};
		},
		create: function(receiver) {
			return function(done) {
				co(function *() {
					var perms = yield Permission.createPermissionSettings();

					var data = {
						memberId: receiver.memberId,
						name: receiver.name,
						displayname: receiver.displayname,
						email: receiver.email,
						phone: receiver.phone,
						address: receiver.address,
						permissions: perms
					};

					var _receiver = new Receiver(data);

					_receiver.save(function(err) {

						done(err, _receiver);
					});
				});

			};
		},
		getReceiverByName: function(name) {
			// for check receiver name can't be double
			return function(done) {
				Receiver
					.findOne({ name: name }, function(err, receiver) {
						if (err)
							return done(err);

						if (!receiver)
							return done();

						return done(null, receiver.toObject());
					});
			};
		},
		list: function() {
			var conditions = {};
			var columns;
			var opts = {};
			if (arguments.length == 3) {
				conditions = arguments[0];
				columns = arguments[1];
				opts = arguments[2];
			} else if (arguments.length == 2) {
				if (arguments[0] instanceof Array) {
					columns = arguments[0];
					opts = arguments[1];
				} else if (arguments[1] instanceof Array) {
					conditions = arguments[0];
					columns = arguments[1];
				} else {
					conditions = arguments[0];
					opts = arguments[1];
				}
			} else if (arguments.length == 1) {
				columns = null;
				opts = arguments[0];
			}

			return function(done) {

				var cols = null;
				if (columns)
					cols = columns.join(' ');

				Receiver.count(conditions, function(err, count) {
					if (err) {
						done(err);
						return;
					}

					if (!count) {
						done(err, { count: 0 });
						return;
					}

					Receiver
						.find(conditions, cols, opts, function(err, receivers) {
							done(err, {
								count: count,
								receivers: receivers
							});
						})
						.sort({created: 1});
				});
			};
		}
	};
};
