/** Action Type Constants: */
const LOAD_SPOTS = 'spots/loadSpots'; 
const RECEIVE_SPOT = 'spots/receiveSpot';
const LOAD_REVIEWS = 'spots/loadReviews';

/**  Action Creators: */
export const loadSpots = (spots) => ({
    type: LOAD_SPOTS,
    spots
});  

export const receiveSpot = (spot) => ({
    type: RECEIVE_SPOT,
    spot
});

export const loadReviews = (reviews) => ({
    type: LOAD_REVIEWS,
    reviews
});


/** Thunk Action Creators: */
export const fetchSpots = () => async (dispatch) => {
    const response = await fetch('/api/spots'); 
    const spots = await response.json(); 
    dispatch(loadSpots(spots)); 
 }

export const fetchSpotDetails = (spotId) => async (dispatch) => {
    const response = await fetch(`/api/spots/${spotId}`); 
    const spotDetails = await response.json(); 
    dispatch(receiveSpot(spotDetails)); 
}

export const fetchReviews = (spotId) => async (dispatch) => {
    const response = await fetch(`/api/spots/${spotId}/reviews`);
    const allReviews = await response.json(); 
    dispatch(loadReviews(allReviews)); 
}

/** Reducer: */
const initialState = {}; 

function spotReducer(state = initialState, action) {
    switch (action.type) {
        case LOAD_SPOTS: {
            return {...state, ...action.spots}
        }
        case RECEIVE_SPOT: {
            return {...state, ...action.spot}
        }
        case LOAD_REVIEWS: {
            return {...state, ...action.reviews}
        }

        default:
            return state;
    }
}

export default spotReducer;