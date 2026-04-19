import React from "react"
import Awards from "./awards/Awards"
import Featured from "./featured/Featured"
import Hero from "./hero/Hero"
import Location from "./location/Location"
import Price from "./price/Price"
import Recent from "./recent/Recent"
import Team from "./team/Team"
import PropertyMap from "../map/PropertyMap"
import "./Home.css"

const Home = () => {
  return (
    <>
      <Hero />
      <Featured />
      <div className="home-map-preview">
        <PropertyMap variant="preview" radius={5000} />
      </div>
      {/* <Recent /> */}
      {/* <Awards /> */}
      <Location />
      {/* <Team /> */}
      {/* <Price /> */}
    </>
  )
}

export default Home
