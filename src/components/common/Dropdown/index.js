import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const Dropdown = ({ label, selectedValue, onChangeSelectedValue, type }) => {
    const options = useSelector(state => state[type]?.tableData || []);
    const [selectedId, setSelectedId] = useState(() => selectedValue || options?.[0]?.id || '');
    const onChangeSelection = e => {
        setSelectedId(e.target.value);
        onChangeSelectedValue(e)
    }
    return (
        <div className='field'>
            <label htmlFor={`dropdown_${type}`}>
              <span>{label}</span>
            <select
                id={`dropdown_${type}`}
                value={selectedId}
                onChange={onChangeSelection}
            >
                {options.map((item) => {
                    return (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    );
                })}
            </select>
            </label>
        </div>
    )
}

export default Dropdown;