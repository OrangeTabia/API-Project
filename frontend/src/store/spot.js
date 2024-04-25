import { csrfFetch } from "./csrf";

/** Action Type Constants: */
const LOAD_SPOTS = 'spots/loadSpots'; 
const RECEIVE_SPOT = 'spots/receiveSpot';
const UPDATE_SPOT = 'spots/updateSpot';
const ADD_IMAGE = '/spots/addImage'; 
const REMOVE_SPOT = '/spots/removeSpot'; 
const LOAD_REVIEWS = 'spots/loadReviews'; 
const ADD_REVIEW = '/spots/addReview'; 
const REMOVE_REVIEW = 'spots/removeReview';


/**  Action Creators: */
export const loadSpots = (spots) => ({
    type: LOAD_SPOTS,
    spots
});  

export const receiveSpot = (spot) => ({
    type: RECEIVE_SPOT,
    spot
});

export const updateSpot = (spot) => ({
    type: UPDATE_SPOT,
    spot
});

export const addImage = (image) => ({
    type: ADD_IMAGE, 
    image
});


export const loadReviews = (reviews) => ({
    type: LOAD_REVIEWS,
    reviews
});

export const addReview = (review, user) => ({
    type: ADD_REVIEW,
    review, 
    user
});

export const removeSpot = (spotId) => ({
    type: REMOVE_SPOT,
    spotId
}); 

export const removeReview = (reviewId) => ({
    type: REMOVE_REVIEW, 
    reviewId
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

export const fetchCreateSpot = (spot) => async (dispatch) => {
    const response = await csrfFetch('/api/spots', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(spot)
    });
    if (response.ok) {
        const newSpot = await response.json();
        dispatch(updateSpot(newSpot)); 
        return newSpot;
    } else {
        const errors = await response.json();
        return errors;
    }
}

export const fetchEditSpot = (spot, spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(spot)
    });
    if (response.ok) {
        const updatedSpot = await response.json(); 
        dispatch(updateSpot(updatedSpot)); 
        return updatedSpot;
    } else {
        const errors = await response.json(); 
        return errors;
    }
}

export const fetchAddImage = (imageInfo, spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/images`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(imageInfo)
    }); 
    if (response.ok) {
        const newImage = await response.json();
        dispatch(addImage(newImage)); 
        return newImage;
    } else {
        const errors = await response.json();
        return errors;
    }
}

export const fetchLoadCurrentUserSpots = () => async (dispatch) => {
    const response = await fetch('/api/spots/current'); 
    const spots = await response.json(); 
    dispatch(loadSpots(spots)); 
 }

export const fetchDeleteSpot = (spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
    }); 
    if (response.ok) {
        dispatch(removeSpot(spotId)); 
    } else {
        const errors = await response.json();
        return errors;
    }
}

export const fetchReviews = (spotId) => async (dispatch) => {
    const response = await fetch(`/api/spots/${spotId}/reviews`);
    const allReviews = await response.json(); 
    dispatch(loadReviews(allReviews)); 
}

export const fetchAddReview = (review, spotId, currentUser) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(review)
    });
    if (response.ok) {
        const newReview = await response.json();
        dispatch(addReview(newReview, currentUser));
        
        return newReview;
    } else {
        const errors = await response.json();
        return errors;
    }
}

export const fetchDeleteReview = (reviewId) => async (dispatch) => {
    const response = await csrfFetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    });
    if (response.ok) {
        dispatch(removeReview(reviewId));
    } else {
        const errors = response.json(); 
        return errors;
    }
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
            // TODO: Add a sort statement here
            return {...state, ...action.reviews}
        }
        case UPDATE_SPOT: {
            return {...state, [action.spot.id]: action.spot}
        }
        case ADD_IMAGE: {
            return {...state, ...action.image}
        }
        case ADD_REVIEW: {
            return {...state, Reviews: [
                {
                    ...action.review,
                    User: action.user,
                }, 
                ...state.Reviews
            ]}
        }
        case REMOVE_SPOT: {
            const newState = {...state};
            delete newState[action.spotId];
            return newState;
        }
        case REMOVE_REVIEW : {
            const newState = {...state};
            delete newState[action.reveiwId];
            return newState;
        }


        default:
            return state;
    }
}

export default spotReducer;