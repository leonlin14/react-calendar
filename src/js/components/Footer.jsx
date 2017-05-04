import React from 'react';

// Decorators
import { flux } from 'Decorator';

@flux
class Footer extends React.Component {
	render() {
		return (
			<div className={'ui basic inverted center aligned segment'}>
				<span>Copyright &copy; 2016 {this.flux.getState('Service').name} Project. All Rights Reserved.</span>
			</div>
		);
	}
};

export default Footer;
