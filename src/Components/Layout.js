import React, { Component } from 'react';
import Chart from './Chart';

class Layout extends Component {
  render() {
		const props = this.props;
		let blocks = [];
		for(let key in props){
			blocks.push({[key]: props[key]})
		}

    return (
      <div className="container">
				{blocks.map((e, idx) => <Chart {...e} key={idx}></Chart>)}
			</div>
    );
  }
}

export default Layout;
