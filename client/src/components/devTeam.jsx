import React from "react";

const DevTeam = () => {
  return (
    <React.Fragment>
      <div className="row sl-page-heading">
        <h2>Development Team</h2>
      </div>
      <hr className="divider" />

      <section className="row dev-team">
        <div className="col-md-4 bio">
          <div className="text-center">
            <img alt="David" className="img-fluid" src="/img/david.jpg" />
            <h3>David Coopersmith</h3>
            <p className="title">Full Stack Developer</p>
            <p className="location">Moreno Valley, CA</p>
          </div>
        </div>
        <div className="col-md-4 bio">
          <div className="text-center">
            <img alt="Brooks" className="img-fluid" src="/img/brooks.jpg" />
            <h3>Brooks Przybylek</h3>
            <p className="title">Full Stack Developer</p>
            <p className="location">Dallas, TX</p>
          </div>
        </div>
        <div className="col-md-4 bio">
          <div className="text-center">
            <img alt="Alex" className="img-fluid" src="/img/alex.jpg" />
            <h3>Alex Rueb</h3>
            <p className="title">Full Stack Developer</p>
            <p className="location">Austin, TX</p>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default DevTeam;
