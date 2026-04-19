// // import React, { useState } from "react";
// // import Heading from "../../common/Heading";
// // import PropertyList from "../../property_list/PropertyList"; // Import the PropertyList component
// // import axios from "axios";
// // import "./hero.css";

// // const Hero = () => {
// //   const [searchParams, setSearchParams] = useState({
// //     location: "",
// //     propertyType: "",
// //     minPrice: "",
// //     maxPrice: "",
// //   });
// //   const [properties, setProperties] = useState([]); // State to hold search results

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setSearchParams((prev) => ({
// //       ...prev,
// //       [name]: value,
// //     }));
// //   };

// //   // const handleSubmit = async (e) => {
// //   //   e.preventDefault();
// //   //   try {
// //   //     const response = await axios.get("http://localhost:5000/api/properties/search", {
// //   //       params: {
// //   //         location: searchParams.location,
// //   //         propertyType: searchParams.propertyType,
// //   //         minPrice: searchParams.minPrice,
// //   //         maxPrice: searchParams.maxPrice,
// //   //       },
// //   //     });
// //   //     setProperties(response.data); // Set the response data to properties
// //   //   } catch (error) {
// //   //     console.error("Error searching properties:", error);
// //   //   }
// //   // };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       console.log("Search Params:", searchParams); // Log search parameters
// //       const response = await axios.get("http://localhost:5000/api/properties/search", {
// //         params: {
// //           location: searchParams.location,
// //           propertyType: searchParams.propertyType,
// //           minPrice: searchParams.minPrice,
// //           maxPrice: searchParams.maxPrice,
// //         },
// //       });
// //       console.log("Search Results:", response.data); // Log the search results
// //       setProperties(response.data); // Set the response data to properties
// //     } catch (error) {
// //       console.error("Error searching properties:", error);
// //     }
// //   };
  
// //   return (
// //     <section className='hero'>
// //       <div className='container'>
// //         <Heading title='Search Your Next Home ' subtitle='Find new & featured property located in your local city.' />

// //         <form className='flex' onSubmit={handleSubmit}>
// //           <div className='box'>
// //             <span>City/Street</span>
// //             <input type='text' name='location' placeholder='Location' onChange={handleChange} />
// //           </div>
// //           <div className='box'>
// //             <span>Property Type</span>
// //             <input type='text' name='propertyType' placeholder='Property Type' onChange={handleChange} />
// //           </div>
// //           <div className='box'>
// //             <span>Min Price</span>
// //             <input type='number' name='minPrice' placeholder='Min Price' onChange={handleChange} />
// //           </div>
// //           <div className='box'>
// //             <span>Max Price</span>
// //             <input type='number' name='maxPrice' placeholder='Max Price' onChange={handleChange} />
// //           </div>
// //           <button className='btn1'>
// //             <i className='fa fa-search'></i>
// //           </button>
// //         </form>

// //         {/* Display the search results */}
// //         <PropertyList properties={properties} />
// //       </div>
// //     </section>
// //   );
// // };

// // export default Hero;
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Heading from "../../common/Heading";
// import "./hero.css";

// const Hero = () => {
//   const [searchParams, setSearchParams] = useState({
//     location: "",
//     propertyType: "",
//     minPrice: "",
//     maxPrice: "",
//   });
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setSearchParams((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Build URL search parameters
//     const params = new URLSearchParams(searchParams).toString();
//     // Navigate to the results page with search parameters
//     navigate(`/search-results?${params}`);
//   };

//   return (
//     <section className="hero">
//       <div className="container">
//         <Heading title="Search Your Next Home " subtitle="Find new & featured property located in your local city." />

//         <form className="flex" onSubmit={handleSubmit}>
//           <div className="box">
//             <span>City/Street</span>
//             <input type="text" name="location" placeholder="Location" onChange={handleChange} />
//           </div>
//           {/* <div className="box">
//             <span>Property Type</span>
//             <input type="text" name="propertyType" placeholder="Property Type" onChange={handleChange} />
//           </div> */}
//           <div className="box">
//             <span>Min Price</span>
//             <input type="number" name="minPrice" placeholder="Min Price" onChange={handleChange} />
//           </div>
//           <div className="box">
//             <span>Max Price</span>
//             <input type="number" name="maxPrice" placeholder="Max Price" onChange={handleChange} />
//           </div>
//           <button className="btn1">
//             <i className="fa fa-search"></i>
//           </button>
//         </form>
//       </div>
//     </section>
//   );
// };

// export default Hero;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Heading from "../../common/Heading";
import "./hero.css";

const Hero = () => {
  const [searchParams, setSearchParams] = useState({
    location: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams).toString();
    navigate(`/search-results?${params}`);
  };

  return (
    <section className="hero">
      <div className="container">
        <Heading title="Search Your Next Home" subtitle="Find new & featured property located in your local city." />
        <form className="flex" onSubmit={handleSubmit}>
          <div className="box">
            <span>City/Street</span>
            <input type="text" name="location" placeholder="Location" onChange={handleChange} />
          </div>
          {/* <div className="box">
            <span>Property Type</span>
            <input type="text" name="propertyType" placeholder="Property Type" onChange={handleChange} />
          </div> */}
          <div className="box">
            <span>Min Price</span>
            <input type="number" name="minPrice" placeholder="Min Price" onChange={handleChange} />
          </div>
          <div className="box">
            <span>Max Price</span>
            <input type="number" name="maxPrice" placeholder="Max Price" onChange={handleChange} />
          </div>
          <button className="btn1">
            <i className="fa fa-search"></i>
          </button>
        </form>
      </div>
    </section>
  );
};

export default Hero;
