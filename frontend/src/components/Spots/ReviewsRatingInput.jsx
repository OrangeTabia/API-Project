import { IoIosStarOutline } from "react-icons/io";
import { useState, useEffect } from 'react'; 
import './ReviewRatingInput.css';

const StarRatingsInput = ({
    changeStars, 
    stars, 
}) => {
    const [starRating, setStarRating] = useState(0); 

    useEffect(() => {
        setStarRating(starRating); 
    }, [starRating]); 

    return (
        <div className="rating-input">
          <div 
            className={stars >= 1 ? "filled" : "empty"}
            onMouseEnter={() => setStarRating(1)}
            onMouseLeave={() =>  setStarRating(0)}
            onClick={() => changeStars(1)}
          >
            <IoIosStarOutline />
          </div>
          <div 
            className={stars >= 2 ? "filled" : "empty"} 
            onMouseEnter={() => setStarRating(2)}
            onMouseLeave={() => setStarRating(0)}
            onClick={() => changeStars(2)}
          >
            <IoIosStarOutline />
          </div>
          <div 
            className={stars >= 3 ? "filled" : "empty"} 
            onMouseEnter={() => setStarRating(3)}
            onMouseLeave={() => setStarRating(0)}
            onClick={() => changeStars(3)}
          >
            <IoIosStarOutline />
          </div>
          <div 
            className={stars >= 4 ? "filled" : "empty"} 
            onMouseEnter={() => setStarRating(4)}
            onMouseLeave={() => setStarRating(0)}
            onClick={() => changeStars(4)}
          >
            <IoIosStarOutline />
          </div>
          <div 
            className={stars >= 5 ? "filled" : "empty"} 
            onMouseEnter={() => setStarRating(5)}
            onMouseLeave={() => setStarRating(0)}
            onClick={() => changeStars(5)}
          >
            <IoIosStarOutline />
          </div>
          <span>Stars</span>
      </div>
    )
}

export default StarRatingsInput;
