import React, {Component} from 'react';

class AllowNumbers extends Component {
    constructor () {
        super()
        this.state = {value: ''}
    }
    validNum(e) {
        const inputValue  = e.target.value;
        const lastChar = inputValue.slice(-1);
        if ((lastChar >= '0' && lastChar <= '9') || 
            (lastChar === "." && !inputValue.slice(0, -1).includes("."))) {
                this.setState({inputValue: inputValue});
            }
        else {
            this.setState({inputValue: inputValue.slice(0, -1)});
        }
    }

    render () {
        return (
            <div>
                <center>
                    <h1>Allow Users Only Numbers In a Text Box</h1>
                    <h3>Reactjs Class Component</h3>
                    <hr />
                    Enter Numbers: <input type="text"
                    value={this.state.inputValue}
                    onChange={this.validNum.bind(this)}
                    placeholder="Enter Only Numbers..."/>
                </center>
            </div>
        );
    }
}

export default AllowNumbers;