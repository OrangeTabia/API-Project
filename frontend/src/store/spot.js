/** Action Type Constants: */
const LOAD_SPOTS = 'spots/loadSpots'; 
const RECEIVE_SPOT = 'spots/receiveSpot';
const LOAD_REVIEWS = 'spots/loadReviews';
const CREATE_SPOT = 'spots/createSpot'; 
const ADD_IMAGE = '/spots/addImage'; 

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

export const addSpot = (spot) => ({
    type: CREATE_SPOT,
    spot
});

export const addImage = (image) => ({
    type: ADD_IMAGE, 
    image
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

export const fetchCreateSpot = (spot) => async (dispatch) => {
    const response = await csrfFetch('/api/spots', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(spot)
    });
    if (response.ok) {
        const newSpot = await response.json();
        dispatch(addSpot(newSpot)); 
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
        dispatch(addSpot(updatedSpot)); 
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
        case CREATE_SPOT: {
            return {...state, [action.spot.id]: action.spot}
        }
        case ADD_IMAGE:  {
            return {...state, ...action.image}
        }

        default:
            return state;
    }
}

export default spotReducer;