import React from 'react';
import Form from './common/form';

class ReviewEdit extends Form {
  state = {  }
  render() { 
    return ( 
      <React.Fragment>
        <div className="up-heading">
          <h2>Edit Review</h2>
        </div>
        <hr className="divider" />
      </React.Fragment>
     );
  }
}
 
export default ReviewEdit;
