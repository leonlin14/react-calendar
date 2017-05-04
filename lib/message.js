var co = require('co');

module.exports = function(lApp) {

	var settings = lApp.settings;
	var Permission;
	var Message;

	return {
		onload: function(lApp) {
			return function(done) {

				// Libraries
				Permission = lApp.getLibrary('Permission');
				Message = lApp.getModel('Message');

				done();
			};
		},
		create: function(message) {
			return function(done) {
				co(function *() {
					var perms = yield Permission.createPermissionSettings();

					var data = {
						memberId: message.memberId,
						receiverId: message.receiverId,
						message: message.message,
						sendYear: message.sendYear,
						sendMonth: message.sendMonth,
						sendDate: message.sendDate,
						permissions: perms
					};

					var _message = new Message(data);

					_message.save(function(err) {
						// done(err, _message);
						done(err, {
							message: _message
						});
					});
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

				Message.count(conditions, function(err, count) {
					if (err) {
						done(err);
						return;
					}

					if (!count) {
						done(err, { count: 0 });
						return;
					}

					Message
						.find(conditions, cols, opts, function(err, messages) {
							done(err, {
								count: count,
								messages: messages
							});
						})
						.populate('receiverId')
						.sort({updated: -1});
				});
			};
		},
		save: function(id, message) {
			return function(done) {
				var updated = Date.now();

				var m = {
					memberId: message.memberId || undefined,
					receiverId: message.receiverId || undefined,
					message: message.message || undefined,
					video: message.video || false,
					sendYear: message.sendYear || undefined,
					sendMonth: message.sendMonth || undefined,
					sendDate: message.sendDate || undefined,
					updated: updated
				};

				// Remove fields which is unset
				for (var key in m) {
					if (m[key] == undefined)
						delete m[key];
				}

				Message.findOneAndUpdate({ _id: id }, m, { new: true }, function(err, _message) {
					if (err)
						return done(err);

					done(null, _message);
				});
			};
		},
		deleteMessages: function(ids) {
			return function(done) {
				Message.remove({
					_id: {
						$in: ids
					}
				}, function(err) {
					done(err);
				});
			};
		}
	};
};
