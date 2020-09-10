import React from 'react';

const ListGroup = (props) => {
  const { items, onItemSelect, selectedItem } = props;
  return (
    <ul className="list-group list-group-horizontal">
      {items.map((item) => (
        <li onClick={() => onItemSelect(item)}
          key={item}
          className={selectedItem === item ? "list-group-item active" : "list-group-item"} >
          {item}
        </li>
      ))}
    </ul>
  );
}
 
export default ListGroup;