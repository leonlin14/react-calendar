import React from 'react';
import ReactDOM from 'react-dom';
import I18n from 'Extension/I18n.jsx';

import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Calendar from './Calendar.jsx';
import Messages from './Messages.jsx';

// Decorators
import { flux } from 'Decorator';

@flux
class LandingPage extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			user: context.flux.getState('User')
		};
	}

	componentWillMount = () => {
		this.flux.on('state.User', this.flux.bindListener(this.onChange));
	};

	componentWillUnmount = () => {
		this.flux.off('state.User', this.onChange);
	};

	onChange = () => {
		this.setState({
			user: this.flux.getState('User')
		});
	};

	render() {
		return (
			<div className='main-page'>
				<Header ref='header' />

				<section className="panel ui container">
					<div className="ui grid divided">
						<div className="ten wide column calendar">
							<Calendar user={this.state.user} />
						</div>
						<div className="six wide column messages">
							<Messages user={this.state.user} />
						</div>
					</div>
				</section>

				<Footer />
			</div>
		);
	};
}

export default LandingPage;
