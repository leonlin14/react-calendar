import React from 'react';

// Decorators
import { router, flux, i18n, preAction } from 'Decorator';

@flux
@i18n
class PermissionGroup extends React.Component {

	static propTypes = {
		checked: React.PropTypes.bool,
		name: React.PropTypes.string,
		availPerms: React.PropTypes.object,
		perms: React.PropTypes.object
	};

	constructor() {
		super();

		this.state = {
			allChecked: false,
			allUnchecked: true,
			perms: {}
		};
	}

	componentDidMount = () => {
		var self = this;

		$(this.refs.checkbox)
			.checkbox({
				onChecked: function() {

					for (var id in self.state.perms) {
						self.state.perms[id] = true;
					}

					self.setupCheckbox();
					self.forceUpdate();
				},
				onUnchecked: function() {

					for (var id in self.state.perms) {
						self.state.perms[id] = false;
					}

					self.setupCheckbox();
					self.forceUpdate();
				}
			});
	};

	componentDidUpdate = () => {

		// set parent checkbox state, but dont trigger its onChange callback
		if (this.state.allChecked) {
			$(this.refs.checkbox).checkbox('set checked');
		} else if(this.state.allUnchecked) {
			$(this.refs.checkbox).checkbox('set unchecked');
		} else {
			$(this.refs.checkbox).checkbox('set indeterminate');
		}
	};

	componentWillReceiveProps = (nextProps) => {
		var perms = {};
		for (var name in nextProps.availPerms) {
			perms[name] = false;
		}

		for (var name in nextProps.perms) {
			perms[name] = nextProps.perms[name];
		}

		var allChecked = true;
		var allUnchecked = true;

		// Checking all of permission items
		for (var name in this.props.availPerms) {
			if (perms[name])
				allUnchecked = false;
			else
				allChecked = false;
		}

		var newState = {
			perms: perms,
			allChecked: allChecked,
			allUnchecked: allUnchecked
		};

		if (this.state.checked != nextProps.checked)
			newState.checked = nextProps.checked;

		this.setState(newState);
	};

	setupCheckbox = () => {

		var allChecked = true;
		var allUnchecked = true;

		// Checking all of permission items
		for (var name in this.props.availPerms) {
			if (this.state.perms[name])
				allUnchecked = false;
			else
				allChecked = false;
		}

		this.state.allChecked = allChecked;
		this.state.allUnchecked = allUnchecked;
	};

	onPermChecked = (id, checked) => {

		// Update value
		this.state.perms[id] = checked;

		this.setupCheckbox();

		this.forceUpdate();
	};

	render = () => {
		var permComps = [];

		// Getting all of permission item
		for (var name in this.props.availPerms) {
			var permName = this.props.availPerms[name];
			var checked = this.state.perms[name];

			permComps.push(
				<PermissionItem
					key={name}
					groupid={this.props.groupid}
					permid={name}
					name={permName}
					checked={checked}
					onChecked={this.onPermChecked} />
			);
		}

		return (
			<div ref='component' className='ui list'>
				<div className='item'>
					<div ref='checkbox' className='ui master checkbox'>
						<input type='checkbox' />
						<label className='header'>{this.props.name}</label>
					</div>
					<div className='list'>
						{permComps}
					</div>
				</div>
			</div>
		);
	};

}

@flux
@i18n
class PermissionItem extends React.Component {

	static propTypes = {
		checked: React.PropTypes.bool,
		groupid: React.PropTypes.string,
		permid: React.PropTypes.string,
		name: React.PropTypes.string
	};

	constructor() {
		super();

		this.state = {
			checked: false
		};
	}

	componentDidMount = () => {
		var self = this;

		var $component = $(this.refs.component);

		$component.checkbox({
			onChange: function() {
				self.props.onChecked(self.props.permid, $component.checkbox('is checked'));
			}
		});
	};

	componentDidUpdate = () => {
		if (this.state.checked) {
			$(this.refs.component).checkbox('set checked');
		} else {
			$(this.refs.component).checkbox('set unchecked');
		}
	};

	componentWillReceiveProps = (nextProps) => {
		this.setState({
			checked: nextProps.checked
		});
	};

	render = () => {
		return (
			<div ref='component' className={'ui child item checkbox'}>
				<input type='checkbox' name={this.props.groupid + '.' + this.props.permid} />
				<label>{this.props.name}</label>
			</div>
		);
	};

}

@flux
@i18n
@preAction('Admin.Permission.getAvailablePermission')
class PermissionPanel extends React.Component {

	constructor(props, context) {
		super(props, context);

		var permission = this.flux.getState('Admin.Permission');

		this.state = {
			availPerms: permission.availPerms,
			groups: permission.groups,
			perms: props.perms || {}
		};
	}

	componentWillMount = () => {
		this.flux.on('state.Admin.Permission', this.flux.bindListener(this.onChange));
	};

	componentWillUnmount = () => {
		this.flux.off('state.Admin.Permission', this.onChange);
	};

	componentWillReceiveProps = (nextProps) => {
		this.setState({
			perms: nextProps.perms || {}
		});
	};

	onChange = () => {
		var permission = this.flux.getState('Admin.Permission');

		this.setState({
			availPerms: permission.availPerms,
			groups: permission.groups
		});
	};

	getCurrentPermissions = () => {

		var perms = {};

		$(this.refs.component)
			.find('.ui.child.checkbox')
			.each(function(index, checkbox) {
				var $checkbox = $(checkbox);
				perms[$checkbox.find('input').attr('name')] = $checkbox.checkbox('is checked');
			});

		return perms;
	};


	render() {
		var groups = {};
		var perms = [];

		// Getting all of permission item
		for (var key in this.state.availPerms) {
			var perm = this.state.availPerms[key];
			var permSet = key.split('.');
			var group = permSet[0];
			var name = permSet[1];

			if (!groups.hasOwnProperty(group))
				groups[group] = {};

			groups[group][name] = perm.name;
		}

		// Prepare groups
		var permGroups = [];
		for (var group in this.state.groups) {
			var groupName = this.state.groups[group];

			// Getting permission settings
			var perms = {};
			if (this.state.perms.hasOwnProperty(group)) {
				perms = this.state.perms[group];
			}

			permGroups.push(
				<PermissionGroup
					groupid={group}
					name={groupName}
					availPerms={groups[group]}
					perms={perms}
					key={group} />
			);
		}

		return (
			<div ref='component' className='ui basic segment' {...this.props}>
				{permGroups}
			</div>
		);
	}
}

export default PermissionPanel;
