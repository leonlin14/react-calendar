import React from 'react';
import { Link } from 'react-router';

import Header from './Header.jsx';

// Decorators
import { router, flux, i18n, preAction } from 'Decorator';

class SuccessPage extends React.Component {

	render() {
		return (
			<div className='column'>
				<h1 className='ui header'>
					<i className='lock icon' />
					<div className='content'>Reset Password</div>
				</h1>

				<div className='ui positive icon message'>
					<i className={'checkmark sign icon'} />
					<div className='content'>
						<div className='header'>Successful</div>
						<p>Your password has been reset successfully!</p>
					</div>
				</div>
			</div>
		);
	}
}

@flux
class ResetPasswordPage extends React.Component {

	constructor(props, context) {
		super(props, context);

		this.state = {
			error: false,
			success: false,
			readyToSubmit: false
		};
	}

	submit = () => {

		this.flux.dispatch('action.User.resetPassword',
			this.props.params.userid,
			this.props.params.token,
			this.refs.password.value, function(err, success) {

				this.setState({
					error: err ? true : false,
					success: success
				});
			}.bind(this));
	};

	handleChange = () => {
		var isValid = true;

		var password = this.refs.password.value;
		var confirm_password = this.refs.confirm_password.value;

		if (!password || !confirm_password)
			isValid = false;

		// Password field doesn't match another field
		if (confirm_password != password)
			isValid = false;

		this.setState({
			readyToSubmit: isValid
		});
	};

	render() {

		var content;

		if (this.state.success) {
			content = <SuccessPage />;
		} else {

			var message;
			if (this.state.error) {
				message = (
					<div className='ui negative icon message'>
						<i className={'warning sign icon'} />
						<div className='content'>
							<div className='header'>Failed to reset password</div>
							<p>Please check your password then try again</p>
						</div>
					</div>
				);
			}

			content = (
				<div className='column'>
					<h1 className='ui header'>
						<i className='retweet icon' />
						<div className='content'>Reset Password</div>
					</h1>

					<div className={'ui basic segment'}>
						{message}

						<div className='ui form'>

							<div className='field'>
								<label>Please enter your new password</label>
								<div className={'ui left icon input'}>
									<i className={'lock icon'} />
									<input
										type='password'
										ref='password'
										name='password'
										autoFocus={true}
										onChange={this.handleChange} />
								</div>
							</div>

							<div className='field'>
								<label>Confirm password</label>
								<div className={'ui left icon input'}>
									<i className={'lock icon'} />
									<input
										type='password'
										ref='confirm_password'
										name='confirm_password'
										onChange={this.handleChange} />
								</div>
							</div>

							<div className='field'>
								<button
									className={'ui ' + (!this.state.readyToSubmit ? 'disabled' : '') + ' teal button'}
									onClick={this.submit}>Reset Password</button>
							</div>
						</div>
					</div>

				</div>
			);
		}

		return (
			<div className='main-page'>
				<Header />
				<div className={'ui basic center aligned padded segment'}>
					<div className='ui hidden divider'></div>
					<div className='ui hidden divider'></div>

					<div className='ui two column centered grid'>
						{content}
					</div>

				</div>
			</div>
		);
	}
}

export default ResetPasswordPage;
