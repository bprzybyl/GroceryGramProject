import React from "react";

class NotFound extends React.Component {

  componentDidMount() {
    document.title = this.props.pageTitle;
  }

  render () {
    return (
      <React.Fragment>
      <h1>Page Not Found</h1>
    </React.Fragment>
    )
  }
}

export default NotFound;
