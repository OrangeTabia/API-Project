import { IoIosStarOutline } from "react-icons/io";
import { IoIosStar } from "react-icons/io";
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
            className="star-1"
            onMouseEnter={() => setStarRating(1)}
            onMouseLeave={() =>  setStarRating(0)}
            onClick={() => changeStars(1)}
          >
            {stars >= 1 ? <IoIosStar /> : <IoIosStarOutline />}
          </div>
          <div 
            className="star-2" 
            onMouseEnter={() => setStarRating(2)}
            onMouseLeave={() => setStarRating(0)}
            onClick={() => changeStars(2)}
          >
            {stars >= 2 ? <IoIosStar /> : <IoIosStarOutline />}
          </div>
          <div 
            className="star-3"
            onMouseEnter={() => setStarRating(3)}
            onMouseLeave={() => setStarRating(0)}
            onClick={() => changeStars(3)}
          >
            {stars >= 3 ? <IoIosStar /> : <IoIosStarOutline />}
          </div>
          <div 
            className="star-4"
            onMouseEnter={() => setStarRating(4)}
            onMouseLeave={() => setStarRating(0)}
            onClick={() => changeStars(4)}
          >
            {stars >= 4 ? <IoIosStar /> : <IoIosStarOutline />}
          </div>
          <div 
            className="star-5"
            onMouseEnter={() => setStarRating(5)}
            onMouseLeave={() => setStarRating(0)}
            onClick={() => changeStars(5)}
          >
            {stars >= 5 ? <IoIosStar /> : <IoIosStarOutline />}
          </div>
          <span>Stars</span>
      </div>
    )
}

export default StarRatingsInput;
