import React, { Component } from 'react';
import io from 'socket.io-client';
import Layout from './Layout';
import '../style/App.css';

const socketUrl = "localhost:3231";

class App extends Component {
	state = {
		socket: null,
		data: {}
	};

	componentWillMount(){
		this.initSocket()
	}

	initSocket = () => {
		const socket = io(socketUrl)
		socket.on("data", (data) => {
			this.setState({
				socket,
				data
			});
		});
	}

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Server access analysis - EPA</h1>
        </header>
				<Layout {...this.state.data}/>
      </div>
    );
  }
}

export default App;
