import React from 'react'

const CurrencyField = props => {

  let inputValue = 0

  const getPrice = (e) => {
    const value  = e.target.value;
    props.getSwapPrice(value)
  }

  const validateNumber = (e) => {
    inputValue  = e.target.value;
    const lastChar = inputValue.slice(-1);
    if (!((lastChar >= '0' && lastChar <= '9') || 
        (lastChar === "." && !inputValue.slice(0, -1).includes(".")))) {
      inputValue = inputValue.slice(0, -1);
    }
    e.target.value = inputValue;
  }
    
  return (
    <div className="row currencyInput">
      <div className="col-md-6 numberContainer">
      {/* <input name="firstName" onChange={"alert('KeyPressed')"} /> */}
        {props.loading ? (
          <div className="spinnerContainer">
            {<props.spinner />}
          </div>
        ) : (
          <input
            className="currencyInputField"
            placeholder="0.0"
            value={props.value}
            onBlur={e => (props.field === 'input' ? getPrice(e) : null)}
            onChange={e => (validateNumber(e))}
            />
        )}
      </div>
      <div className="col-md-6 tokenContainer">
        <span className="tokenName">{props.tokenName}</span>
        <div className="balanceContainer">
          <span className="balanceAmount">Balance: {props.balance?.toFixed(4)}</span>
        </div>
      </div>
    </div>
  )
}

export default CurrencyField
