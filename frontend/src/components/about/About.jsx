import React from "react";
import Back from "../common/Back";
import Heading from "../common/Heading";
import img from "../images/about.jpg";
import "./about.css";

const About = () => {
  return (
    <>
      <section className="about">
        <Back name="About Us" title="About Us - Who We Are?" cover={img} />
        <div className="container flex mtop">
          <div className="left row">
            <Heading
              title="Our Story"
              subtitle="Check out our company story and work process"
            />

            <p>
              Welcome to RentUP, your trusted real estate marketplace designed
              to transform the way property transactions happen. With a mission
              to simplify and secure the process of finding, listing, and
              renting properties, RentUP offers a user-friendly platform built
              on transparency, trust, and convenience. 
            </p>
            <button className="btn2">More About Us</button>
          </div>
          <div className="right row">
            <img src="./immio.jpg" alt="" />
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
