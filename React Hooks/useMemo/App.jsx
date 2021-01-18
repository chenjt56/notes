import React, { memo, useState, useMemo } from 'react';

const Child = memo(function Child(props) {
  console.log("Child render");
  return <h1>value:{props.value}</h1>
});

export default props => {
  const [value, setValue] = useState(0);
  const increase = useMemo(() => {
    if (value > 2) return value + 1;
  }, [value]);

  return (
    <>
      <Child value={increase} />
      <button
        type='button'
        onClick={() => {
          setValue(value + 1);
        }}
      >
        value: {value};
        increase: {increase || 0}
      </button>
    </>
  )
}
